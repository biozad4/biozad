"use server";

import { supabase, query as pgQuery } from "@/lib/supabase";

function mapPosProduct(p: any) {
  return {
    _id: p.id,
    id: p.id,
    title: { ar: p.title_ar, fr: p.title_fr },
    price: Number(p.price),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
    stock: p.stock,
    sku: p.sku,
    barcode: p.barcode,
    images: p.images || [],
    slug: p.slug,
    variants: (p.product_variants || []).map((v: any) => ({
      _id: v.id,
      sku: v.sku,
      barcode: v.barcode,
      weight: v.weight,
      price: Number(v.price),
      stock: v.stock,
    })),
  };
}

// 1. البحث الفوري عن المنتج من خلال مسح الباركود أو الـ SKU
export async function findProductByBarcode(barcode: string) {
  try {
    const cleanCode = barcode.trim();

    // البحث كمنتج رئيسي
    const { data: product } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .or(`barcode.eq.${cleanCode},sku.eq.${cleanCode}`)
      .maybeSingle();

    if (product) {
      return { 
        success: true, 
        product: mapPosProduct(product), 
        isVariant: false 
      };
    }

    // البحث داخل المتغيرات
    const { data: variantRow } = await supabase
      .from("product_variants")
      .select("*, products(*)")
      .or(`barcode.eq.${cleanCode},sku.eq.${cleanCode}`)
      .maybeSingle();

    if (variantRow && variantRow.products) {
      return {
        success: true,
        product: mapPosProduct(variantRow.products),
        isVariant: true,
        variant: {
          _id: variantRow.id,
          sku: variantRow.sku,
          barcode: variantRow.barcode,
          weight: variantRow.weight,
          price: Number(variantRow.price),
          stock: variantRow.stock,
        }
      };
    }

    return { success: false, message: "لم يتم العثور على المنتج / Non trouvé" };
  } catch (error) {
    console.error("POS barcode scan error:", error);
    return { success: false, message: "حدث خطأ أثناء فحص الباركود" };
  }
}

// 2. إتمام عملية البيع وخصم المخزون وإنشاء الفاتورة
export async function submitPosSale(payload: {
  items: any[];
  paymentMethod: "cash_pos" | "card_pos";
  subtotal: number;
  total: number;
  cashierId: string;
}) {
  try {
    const { items, paymentMethod, subtotal, total, cashierId } = payload;
    
    if (!items || items.length === 0) {
      return { success: false, message: "العربة فارغة حالياً" };
    }

    const orderNumber = `BZ-POS-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: newPosOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        subtotal,
        shipping_cost: 0,
        total,
        source: "pos",
        payment_method: paymentMethod,
        status: "delivered",
        cashier_id: cashierId || null,
      })
      .select("id")
      .single();

    if (orderError || !newPosOrder) {
      throw new Error(orderError?.message || "فشل تسجيل فاتورة البيع");
    }

    // تحديث المخزون وحفظ العناصر
    for (const item of items) {
      await supabase.from("order_items").insert({
        order_id: newPosOrder.id,
        product_id: item.productId,
        variant_sku: item.variantSku || null,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      });

      if (item.variantSku) {
        await pgQuery(
          "UPDATE product_variants SET stock = stock - $1 WHERE sku = $2",
          [item.quantity, item.variantSku]
        );
      } else {
        await pgQuery(
          "UPDATE products SET stock = stock - $1 WHERE id = $2",
          [item.quantity, item.productId]
        );
      }

      await supabase.from("stock_movements").insert({
        product_id: item.productId,
        variant_sku: item.variantSku || null,
        quantity: -item.quantity,
        type: "pos_sale",
        performed_by: cashierId || null,
        notes: `POS Direct Sale: ${orderNumber}`,
      });
    }

    return { success: true, orderNumber };
  } catch (error: any) {
    console.error("POS transaction submit error:", error);
    return { success: false, message: `فشل في تسجيل فاتورة البيع المباشر: ${error.message}` };
  }
}