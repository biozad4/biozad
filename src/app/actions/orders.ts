"use server";

import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { StockMovement } from "@/models/StockMovement";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { User } from "@/models/User";
import { getStoreSettings } from "@/app/actions/storeSettings";


// تحديد مخطط التحقق من البيانات المرسلة من صفحة الطلب باستخدام Zod
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
    await connectDB();
    const session = await auth();
    const customerId = session?.user ? (session.user as any).id : undefined;

    // التحقق من صحة البيانات المدخلة
    const validation = checkoutSchema.safeParse(rawData);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const { name, phone, city, address, notes, items, discountAmount } = validation.data;
    const appliedDiscount = discountAmount || 0;

    // حساب المجاميع والشحن ديناميكياً من إعدادات المتجر في قاعدة البيانات
    const settingsRes = await getStoreSettings();
    const settings = settingsRes.success && settingsRes.settings 
      ? settingsRes.settings 
      : { shippingCost: 40, freeShippingMin: 400, isFreeShippingGlobally: false };

    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingCost = settings.isFreeShippingGlobally
      ? 0
      : (subtotal - appliedDiscount) >= settings.freeShippingMin
      ? 0
      : settings.shippingCost;
    const total = Math.max(0, subtotal - appliedDiscount + shippingCost);

    // التحقق من توافر المخزون قبل الخصم
    for (const item of items) {
      // التحقق هل هذا العنصر هو باقة السعادة الشاملة
      const isDefaultBundle = item.id === "biozad-happiness-bundle";
      let isFeaturedBundle = false;
      
      const mongoose = require("mongoose");
      if (!isDefaultBundle && mongoose.Types.ObjectId.isValid(item.id)) {
        const { FeaturedBundleModel } = require("@/models/FeaturedBundle");
        const exists = await FeaturedBundleModel.exists({ _id: item.id });
        if (exists) {
          isFeaturedBundle = true;
        }
      }

      // إذا كان العنصر باقة، نتخطى التحقق من المخزون
      if (isDefaultBundle || isFeaturedBundle) {
        continue;
      }

      const product = await Product.findById(item.id);
      if (!product) {
        return { success: false, message: `المنتج غير متوفر في النظام / Produit inexistant` };
      }

      if (item.variantSku) {
        // التحقق من مخزون المتغير (Variant)
        const variant = product.variants.find((v: any) => v.sku === item.variantSku);
        if (!variant || variant.stock < item.quantity) {
          return { success: false, message: `عذراً، الكمية المطلوبة من ${product.title.ar} غير متوفرة / Stock insuffisant` };
        }
      } else {
        // التحقق من مخزون المنتج الرئيسي
        if (product.stock < item.quantity) {
          return { success: false, message: `عذراً، الكمية المطلوبة من ${product.title.ar} غير متوفرة / Stock insuffisant` };
        }
      }
    }

    // توليد رقم الطلب العشوائي الفريد
    const orderNumber = `BZ-${Math.floor(10000 + Math.random() * 90000)}`;

    // إنشاء الطلب في قاعدة البيانات
    const newOrder = await Order.create({
      orderNumber,
      customer: customerId,
      guestDetails: { name, phone, city, address, notes },
      items: items.map((item) => {
        const isDefaultBundle = item.id === "biozad-happiness-bundle";
        // إذا كان هو الباقة الافتراضية، نضع له معرّفاً وهمياً صالحاً لتفادي خطأ المونغوس ObjectId Cast
        const productId = isDefaultBundle ? "640000000000000000000000" : item.id;
        return {
          product: productId,
          variantSku: item.variantSku || undefined,
          title: item.title.ar, // يتم الحفظ باللغة الأساسية للطلبات
          quantity: item.quantity,
          price: item.price,
        };
      }),
      subtotal,
      shippingCost,
      discountAmount: appliedDiscount,
      total,
      source: "website",
      paymentMethod: "cod",
      status: "pending",
    });

    // تحديث المخزون وتسجيل حركات المخزون للعمليات اللاحقة
    for (const item of items) {
      const isDefaultBundle = item.id === "biozad-happiness-bundle";
      let isFeaturedBundle = false;
      const mongoose = require("mongoose");
      if (!isDefaultBundle && mongoose.Types.ObjectId.isValid(item.id)) {
        const { FeaturedBundleModel } = require("@/models/FeaturedBundle");
        const exists = await FeaturedBundleModel.exists({ _id: item.id });
        if (exists) {
          isFeaturedBundle = true;
        }
      }

      // إذا كانت باقة، نتخطى خصم المخزون وتسجيل حركته
      if (isDefaultBundle || isFeaturedBundle) {
        continue;
      }

      if (item.variantSku) {
        // خصم المخزون من المتغير المحدد (Variant)
        await Product.updateOne(
          { _id: item.id, "variants.sku": item.variantSku },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } else {
        // خصم المخزون من المنتج الرئيسي
        await Product.updateOne(
          { _id: item.id },
          { $inc: { stock: -item.quantity } }
        );
      }

      // تسجيل حركة المخزون فورا (Stock Movement) لحفظ السجل
      await StockMovement.create({
        product: item.id,
        variantSku: item.variantSku || undefined,
        quantity: -item.quantity,
        type: "website_sale",
        performedBy: newOrder._id, // نربط الحركة بمعرف الطلب كمرجع
        notes: `Website order: ${orderNumber}`,
      });
    }

    // إبطال/حذف كوبونات الخصم المستخدمة لمنع إعادة استخدامها
    if (validation.data.usedCoupons && validation.data.usedCoupons.length > 0) {
      const { Coupon } = require("@/models/Coupon");
      for (const couponCode of validation.data.usedCoupons) {
        await Coupon.deleteOne({ code: couponCode.toUpperCase() });
      }
    }

    return { success: true, orderNumber };
  } catch (error) {
    console.error("Checkout process error:", error);
    return { success: false, message: "حدث خطأ غير متوقع أثناء المعالجة / Erreur système" };
  }
}