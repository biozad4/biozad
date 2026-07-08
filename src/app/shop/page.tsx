import React, { Suspense } from "react"; // استيراد Suspense للحماية
import { ShopSection } from "@/components/customer/ShopSection";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";

async function fetchCategories() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Failed to load categories in shop page:", error);
    return [];
  }
}

export default async function ShopPage() {
  const categories = await fetchCategories();

  const fallbackCategories = categories.length > 0 ? categories : [
    { slug: "amlou", name: { ar: "أملو الفاخر", fr: "Amlou" } },
    { slug: "tea", name: { ar: "الشاي المغربي", fr: "Thé" } },
    { slug: "bundles", name: { ar: "الباقات وهدايا", fr: "Coffrets" } },
    { slug: "offers", name: { ar: "العروض الخاصة", fr: "Offres" } },
    { slug: "furniture", name: { ar: "الأثاث التقليدي", fr: "Artisanat" } }
  ];

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen py-10">
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">المتجر المغربي الفاخر</h1>
        <p className="text-xs text-neutral-500">استمتع بتصفح منتجاتنا الطبيعية والتقليدية المستخلصة بنقاء 100%.</p>
      </div>

      {/* 💡 تغليف المكون بحيز Suspense لضمان التوافق التام والكامل مع خوادم Vercel */}
      <Suspense fallback={
        <div className="text-center py-24 text-xs text-neutral-400">
          جاري تحميل المتجر الفاخر...
        </div>
      }>
        <ShopSection categories={fallbackCategories} />
      </Suspense>
    </div>
  );
}