"use server";

import { supabase, query as pgQuery } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. جلب سجل حركات البضائع الأخير وإحصائيات المستودع
export async function getInventoryHistoryAndStats() {
  try {
    const { data: movementsData } = await supabase
      .from("stock_movements")
      .select("*, products:product_id(title_ar, title_fr, sku), users:performed_by(name)")
      .order("created_at", { ascending: false })
      .limit(15);

    const movements = (movementsData || []).map((m: any) => ({
      _id: m.id,
      id: m.id,
      product: m.products ? {
        title: { ar: m.products.title_ar, fr: m.products.title_fr },
        sku: m.products.sku,
      } : null,
      performedBy: m.users ? { name: m.users.name } : null,
      variantSku: m.variant_sku,
      quantity: m.quantity,
      type: m.type,
      notes: m.notes,
      createdAt: m.created_at,
    }));

    const prodCountRes = await pgQuery<{ count: string }>("SELECT COUNT(*) AS count FROM products");
    const totalProducts = Number(prodCountRes[0]?.count || 0);

    const stockSumRes = await pgQuery<{ total_stock: string; out_of_stock: string }>(`
      SELECT 
        COALESCE(SUM(stock), 0) AS total_stock,
        COUNT(*) FILTER (WHERE stock = 0) AS out_of_stock
      FROM products
    `);

    const totalStockUnits = Number(stockSumRes[0]?.total_stock || 0);
    const outOfStockCount = Number(stockSumRes[0]?.out_of_stock || 0);

    return {
      success: true,
      stats: {
        totalProducts,
        totalStockUnits,
        outOfStockCount
      },
      movements
    };
  } catch (error: any) {
    console.error("Failed to fetch inventory data:", error);
    return { success: false, message: error.message };
  }
}

// 2. شحن أو تعديل المخزون
export async function adjustProductStock(payload: {
  productId: string;
  variantSku?: string;
  quantity: number;
  type: "refill" | "manual_adjustment" | "return";
  notes?: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user ? (session.user as any).id : null;

    const { productId, variantSku, quantity, type, notes } = payload;

    if (variantSku) {
      await pgQuery(
        "UPDATE product_variants SET stock = stock + $1 WHERE sku = $2",
        [quantity, variantSku]
      );
    } else {
      await pgQuery(
        "UPDATE products SET stock = stock + $1 WHERE id = $2",
        [quantity, productId]
      );
    }

    await supabase.from("stock_movements").insert({
      product_id: productId,
      variant_sku: variantSku || null,
      quantity,
      type,
      performed_by: userId || null,
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