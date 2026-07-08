"use server";

import { connectDB } from "@/lib/db";
import { FeaturedBundleModel } from "@/models/FeaturedBundle";
import { revalidatePath } from "next/cache";

// 1. جلب بيانات باقة السعادة الشاملة
export async function getFeaturedBundleSettings() {
  try {
    await connectDB();
    const bundle = await FeaturedBundleModel.findOne().lean();
    return { success: true, bundle: bundle ? JSON.parse(JSON.stringify(bundle)) : null };
  } catch (error: any) {
    console.error("Error getting featured bundle settings:", error);
    return { success: false, message: error.message };
  }
}

// 2. حفظ وتعديل بيانات الباقة من الداشبورد
export async function saveFeaturedBundleSettings(data: any) {
  try {
    await connectDB();

    const { 
      title, description, price, compareAtPrice, image, isActive,
      hotProductTitle, hotProductSub, hotProductImage, hotProductLink
    } = data;

    if (!title?.ar || !title?.fr || !description?.ar || !description?.fr || !price || !image) {
      return { success: false, message: "يرجى تعبئة كافة الحقول الأساسية للباقة" };
    }

    const payload = {
      title,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      image,
      isActive: isActive !== false,
      hotProductTitle,
      hotProductSub,
      hotProductImage,
      hotProductLink,
    };

    // البحث عن الباقة الحالية وتحديثها، أو إنشاء باقة جديدة إذا لم توجد
    const existing = await FeaturedBundleModel.findOne();
    let saved;

    if (existing) {
      saved = await FeaturedBundleModel.findByIdAndUpdate(existing._id, payload, { new: true });
    } else {
      saved = await FeaturedBundleModel.create(payload);
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return { 
      success: true, 
      message: "✓ تم حفظ وتحديث باقة السعادة الشاملة بنجاح!", 
      bundle: JSON.parse(JSON.stringify(saved)) 
    };
  } catch (error: any) {
    console.error("Error saving featured bundle settings:", error);
    return { success: false, message: error.message };
  }
}
