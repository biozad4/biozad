import React, { Suspense } from "react";
import { ShopSection } from "@/components/customer/ShopSection";
import { getCategories } from "@/app/actions/categories";

export default async function RemediesPage() {
  const categories = await getCategories();

  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen py-10">
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">الوصفات والخلطات الطبيعية</h1>
        <p className="text-xs text-neutral-500">تركيبات تقليدية مستوحاة من الطب الطبيعي والتراث الأصيل.</p>
      </div>

      <Suspense fallback={
        <div className="text-center py-24 text-xs text-neutral-400">
          جاري تحميل المنتجات...
        </div>
      }>
        <ShopSection categories={categories} forcedCategory="remedies" />
      </Suspense>
    </div>
  );
}
