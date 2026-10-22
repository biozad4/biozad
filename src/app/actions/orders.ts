"use server";

import { supabase, query as pgQuery } from "@/lib/supabase";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getStoreSettings } from "@/app/actions/storeSettings";

// مخطط التحقق من بيانات الطلب
const checkoutSchema = z.object({
  name: z.string().min(3, "الرجاء إدخال الاسم الكامل (3 أحرف على الأقل) / Nom trop court"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح (10 أرقام على الأقل) / Numéro invalide"),
  city: z.string().min(2, "الرجاء تحديد المدينة / Ville requise"),
  address: z.string().min(5, "العنوان بالتفصيل مطلوب / Adresse requise"),
  notes: z.string().optional(),
  discountAmount: z.number().optional(),
  usedCoupons: z.array(z.string()).optional(),
  items: z.array(
    z.object({
      id: z.string(),
      variantSku: z.string().optional(),
      title: z.object({ ar: z.string(), fr: z.string() }),
      quantity: z.number().min(1),
      price: z.number(),
    })
  ).min(1),
});

export async function createOrder(rawData: any) {
  try {
    const session = await auth();
    const customerId = session?.user ? (session.user as any).id : null;

    // 1. التحقق من صحة البيانات
    const validation = checkoutSchema.safeParse(rawData);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const { name, phone, city, address, notes, items, discountAmount } = validation.data;
    const appliedDiscount = discountAmount || 0;

    // 2. حساب المجاميع والشحن ديناميكياً
    const settingsRes = await getStoreSettings();
    const settings = settingsRes.success && settingsRes.settings 
      ? settingsRes.settings 
      : { shippingCost: 40, freeShippingMin: 400, isFreeShippingGlobally: false, whatsappNumber: "212602732533" };

    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingCost = settings.isFreeShippingGlobally
      ? 0
      : (subtotal - appliedDiscount) >= settings.freeShippingMin
      ? 0
      : settings.shippingCost;
    const total = Math.max(0, subtotal - appliedDiscount + shippingCost);

    // 3. التحقق من المخزون
    for (const item of items) {
      if (item.id === "biozad-happiness-bundle") continue;

      const { data: product } = await supabase
        .from("products")
        .select("id, title_ar, stock, product_variants(*)")
        .eq("id", item.id)
        .maybeSingle();

      if (!product) {
        continue;
      }

      if (item.variantSku) {
        const variant = (product.product_variants || []).find((v: any) => v.sku === item.variantSku);
        if (!variant || variant.stock < item.quantity) {
          return { success: false, message: `عذراً، الكمية المطلوبة من ${product.title_ar} غير متوفرة / Stock insuffisant` };
        }
      } else {
        if (product.stock < item.quantity) {
          return { success: false, message: `عذراً، الكمية المطلوبة من ${product.title_ar} غير متوفرة / Stock insuffisant` };
        }
      }
    }

    // 4. توليد رمز الطلب
    const orderNumber = `BZ-${Math.floor(10000 + Math.random() * 90000)}`;

    // 5. حفظ الطلب في Supabase (جدول orders)
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        guest_details: { name, phone, city, address, notes },
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: appliedDiscount,
        total,
        source: "website",
        payment_method: "cod",
        status: "pending",
      })
      .select("id, order_number")
      .single();

    if (orderError || !newOrder) {
      console.error("Order creation error:", orderError);
      throw new Error(orderError?.message || "فشل تسجيل الطلب");
    }

    // 6. حفظ عناصر الطلب وتحديث المخزون
    for (const item of items) {
      const isBundle = item.id === "biozad-happiness-bundle";
      const productId = isBundle ? null : item.id;

      // إدراج عنصر الطلب
      await supabase.from("order_items").insert({
        order_id: newOrder.id,
        product_id: productId,
        variant_sku: item.variantSku || null,
        title: item.title.ar,
        quantity: item.quantity,
        price: item.price,
      });

      if (!isBundle && productId) {
        if (item.variantSku) {
          // خصم من المتغير
          await pgQuery(
            "UPDATE product_variants SET stock = stock - $1 WHERE sku = $2",
            [item.quantity, item.variantSku]
          );
        } else {
          // خصم من المنتج
          await pgQuery(
            "UPDATE products SET stock = stock - $1 WHERE id = $2",
            [item.quantity, productId]
          );
        }

        // تسجيل حركة المخزون
        await supabase.from("stock_movements").insert({
          product_id: productId,
          variant_sku: item.variantSku || null,
          quantity: -item.quantity,
          type: "website_sale",
          notes: `Website order: ${orderNumber}`,
        });
      }
    }

    // 7. تعطيل الكوبونات المستخدمة
    if (validation.data.usedCoupons && validation.data.usedCoupons.length > 0) {
      for (const couponCode of validation.data.usedCoupons) {
        await supabase
          .from("coupons")
          .update({ is_active: false })
          .eq("code", couponCode.toUpperCase().trim());
      }
    }

    return { 
      success: true, 
      orderNumber,
      whatsappNumber: settings.whatsappNumber || "212602732533" 
    };
  } catch (error: any) {
    console.error("Checkout process error:", error);
    return { success: false, message: `حدث خطأ أثناء المعالجة: ${error.message || "Erreur système"}` };
  }
}