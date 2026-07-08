import React, { Suspense } from "react";
import { ShopSection } from "@/components/customer/ShopSection";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";

async function fetchCategories() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).lean();
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Failed to load categories:", error);
    return [];
  }
}

export default async function OtherPage() {
  const categories = await fetchCategories();

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen py-10">
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">منتجات متنوعة أخرى</h1>
        <p className="text-xs text-neutral-500">مقطرات طبيعية، منتجات تجميل، صناعة تقليدية مغربية فاخرة وكل ما تحتاجه.</p>
      </div>

      <Suspense fallback={
        <div className="text-center py-24 text-xs text-neutral-400">
          جاري تحميل المنتجات...
        </div>
      }>
        <ShopSection categories={categories} forcedCategory="other" />
      </Suspense>
    </div>
  );
}
