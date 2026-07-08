"use server";

import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { StockMovement } from "@/models/StockMovement";

// 1. البحث الفوري عن المنتج من خلال مسح الباركود أو الـ SKU
export async function findProductByBarcode(barcode: string) {
  try {
    await connectDB();
    
    // البحث عن منتج رئيسي يطابق الباركود أو الـ SKU
    let product = await Product.findOne({
      $or: [{ barcode: barcode }, { sku: barcode }]
    }).lean();

    if (product) {
      return { success: true, product: JSON.parse(JSON.stringify(product)), isVariant: false };
    }

    // إذا لم يعثر عليه كمنتج رئيسي، نبحث داخل مصفوفة المتغيرات (Variants)
    product = await Product.findOne({ "variants.barcode": barcode }).lean();
    if (product) {
      const variant = product.variants.find((v: any) => v.barcode === barcode);
      return { 
        success: true, 
        product: JSON.parse(JSON.stringify(product)), 
        isVariant: true,
        variant: JSON.parse(JSON.stringify(variant))
      };
    }

    return { success: false, message: "لم يتم العثور على المنتج / Non trouvé" };
  } catch (error) {
    console.error("POS barcode scan error:", error);
    return { success: false, message: "حدث خطأ أثناء فحص الباركود" };
  }
}

// 2. إتمام عملية البيع وخصم المخزون وإنشاء الفاتورة للزبون
export async function submitPosSale(payload: {
  items: any[];
  paymentMethod: "cash_pos" | "card_pos";
  subtotal: number;
  total: number;
  cashierId: string;
}) {
  try {
    await connectDB();

    const { items, paymentMethod, subtotal, total, cashierId } = payload;
    
    if (items.length === 0) {
      return { success: false, message: "العربة فارغة حالياً" };
    }

    // توليد رقم فاتورة فريد للـ POS يبدأ بـ BZ-POS-
    const orderNumber = `BZ-POS-${Math.floor(100000 + Math.random() * 900000)}`;

    // إنشاء الطلب مباشرة بوضعية "مكتمل ومسلم" (Delivered)
    const newPosOrder = await Order.create({
      orderNumber,
      items: items.map((item) => ({
        product: item.productId,
        variantSku: item.variantSku || undefined,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      shippingCost: 0,
      total,
      source: "pos",
      paymentMethod,
      status: "delivered", // مبيعات الـ POS تسلم فورياً في المحل
      cashier: cashierId,
    });

    // تحديث وتعديل المخزون في نفس اللحظة وتسجيل الحركات
    for (const item of items) {
      if (item.variantSku) {
        // خصم المخزون من المتغير المحدد (Variant)
        await Product.updateOne(
          { _id: item.productId, "variants.sku": item.variantSku },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } else {
        // خصم المخزون من المنتج الرئيسي
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }

      // تسجيل حركة المخزون فورا (Stock Movement) لحفظ السجل التراكمي للـ POS
      await StockMovement.create({
        product: item.productId,
        variantSku: item.variantSku || undefined,
        quantity: -item.quantity,
        type: "pos_sale",
        performedBy: cashierId,
        notes: `POS Direct Sale: ${orderNumber}`,
      });
    }

    return { success: true, orderNumber };
  } catch (error) {
    console.error("POS transaction submit error:", error);
    return { success: false, message: "فشل في تسجيل فاتورة البيع المباشر" };
  }
}