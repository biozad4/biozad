"use server";

import { connectDB } from "@/lib/db";
import { LandingPage } from "@/models/LandingPage";
import { Product } from "@/models/Product";

// 1. حفظ أو تعديل صفحة هبوط
export async function saveLandingPage(data: any) {
  try {
    await connectDB();

    const { _id, slug, title, isActive, hero, sections, seo } = data;

    if (!slug) {
      return { success: false, message: "الرابط المخصص (Slug) مطلوب" };
    }

    // التحقق من تكرار الرابط في حال كانت الصفحة جديدة
    if (!_id) {
      const existing = await LandingPage.findOne({ slug });
      if (existing) {
        return { success: false, message: "هذا الرابط المخصص مستخدم بالفعل في صفحة أخرى" };
      }
    }

    let savedPage;
    if (_id) {
      // تعديل الصفحة الحالية
      savedPage = await LandingPage.findByIdAndUpdate(
        _id,
        { slug, title, isActive, hero, sections, seo },
        { new: true }
      );
    } else {
      // إنشاء صفحة هبوط جديدة تماماً
      savedPage = await LandingPage.create({
        slug,
        title,
        isActive,
        hero,
        sections,
        seo,
      });
    }

    return { success: true, page: JSON.parse(JSON.stringify(savedPage)) };
  } catch (error) {
    console.error("Failed to save landing page:", error);
    return { success: false, message: "فشل حفظ صفحة الهبوط في قاعدة البيانات" };
  }
}

// 2. جلب تفاصيل صفحة هبوط للعميل مع تحميل المنتجات المرتبطة بها تلقائياً
export async function getLandingPageBySlug(slug: string) {
  try {
    await connectDB();

    const page = await LandingPage.findOne({ slug, isActive: true })
      .populate({
        path: "sections.products",
        model: Product,
      })
      .lean();

    if (!page) return null;

    return JSON.parse(JSON.stringify(page));
  } catch (error) {
    console.error("Failed to fetch landing page:", error);
    return null;
  }
}