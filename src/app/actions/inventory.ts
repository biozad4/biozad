"use server";

import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { StockMovement } from "@/models/StockMovement";
import { User } from "@/models/User";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. جلب سجل حركات البضائع الأخير وإحصائيات المستودع
export async function getInventoryHistoryAndStats() {
  try {
    await connectDB();

    // جلب آخر 15 حركة مخزون مع جلب تفاصيل المنتج والموظف المسؤول عن الحركة
    const movements = await StockMovement.find()
      .populate({ path: "product", model: Product, select: "title sku" })
      .populate({ path: "performedBy", model: User, select: "name" })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    // حساب إحصائيات سريعة للمستودع
    const totalProducts = await Product.countDocuments();
    
    // حساب إجمالي الوحدات المتوفرة في المستودع حالياً
    const productsInDb = await Product.find({}, "stock variants").lean();
    let totalStockUnits = 0;
    let outOfStockCount = 0;

    for (const p of productsInDb) {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          totalStockUnits += v.stock;
          if (v.stock === 0) outOfStockCount++;
        });
      } else {
        totalStockUnits += p.stock;
        if (p.stock === 0) outOfStockCount++;
      }
    }

    return {
      success: true,
      stats: {
        totalProducts,
        totalStockUnits,
        outOfStockCount
      },
      movements: JSON.parse(JSON.stringify(movements))
    };
  } catch (error: any) {
    console.error("Failed to fetch inventory data:", error);
    return { success: false, message: error.message };
  }
}

// 2. شحن أو تعديل المخزون لمنتج محدد يدوياً من الإدارة
export async function adjustProductStock(payload: {
  productId: string;
  variantSku?: string;
  quantity: number; // قيمة موجبة للزيادة وسالبة للنقصان
  type: "refill" | "manual_adjustment" | "return";
  notes?: string;
}) {
  try {
    await connectDB();
    const session = await auth();
    
    if (!session || !session.user) {
      return { success: false, message: "غير مصرح لك بإجراء هذه العملية" };
    }

    const { productId, variantSku, quantity, type, notes } = payload;

    // 1. تحديث مخزون المنتج أو المتغير في جدول المنتجات
    if (variantSku) {
      await Product.updateOne(
        { _id: productId, "variants.sku": variantSku },
        { $inc: { "variants.$.stock": quantity } }
      );
    } else {
      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: quantity } }
      );
    }

    // 2. تسجيل الحركة في جدول حركات المخزون للتوثيق
    await StockMovement.create({
      product: productId,
      variantSku: variantSku || undefined,
      quantity,
      type,
      performedBy: (session.user as any).id,
      notes: notes || "تحديث يدوي من لوحة الإدارة",
    });

    revalidatePath("/admin");
    revalidatePath("/pos");
    revalidatePath("/shop");

    return { success: true, message: "تم تحديث كمية المخزون وتسجيل الحركة بنجاح!" };
  } catch (error: any) {
    console.error("Failed to adjust stock:", error);
    return { success: false, message: `فشل تعديل المخزون: ${error.message}` };
  }
}