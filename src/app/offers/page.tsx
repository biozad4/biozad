import React, { Suspense } from "react";
import { ShopSection } from "@/components/customer/ShopSection";
import { getCategories } from "@/app/actions/categories";
import { getActiveBundles, getCustomBundleSettings } from "@/app/actions/featuredBundle";
import { FeaturedBundle } from "@/components/customer/FeaturedBundle";
import { AllBundlesGrid } from "@/components/customer/AllBundlesGrid";
import { Sparkles, Gift } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const [categories, bundlesRes, customSettingsRes] = await Promise.all([
    getCategories(),
    getActiveBundles(),
    getCustomBundleSettings(),
  ]);

  const activeBundles = bundlesRes.success ? (bundlesRes.bundles || []) : [];
  const dynamicBundle = activeBundles.find((b: any) => b.isFeatured) || activeBundles[0] || null;
  const isCustomBundleActive = customSettingsRes.success ? customSettingsRes.settings.isActive : false;

  return (
    <div className="bg-[#FAF9F6] dark:bg-neutral-950 min-h-screen py-10 space-y-12">
      
      {/* 1. رأس الصفحة الفاخر */}
      <div className="text-center space-y-3 max-w-3xl mx-auto px-4">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>تخفيضات وعروض حصرية</span>
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white">
          العروض الخاصة والباقات التوفيرية
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed">
          اكتشف باقاتنا المختارة بعناية لتمنحك أقصى درجات التوفير مع الجودة المغربية الأصيلة 100%.
        </p>
      </div>

      {/* 2. عرض الباقات التفاعلي (مع التمرير التلقائي وأزرار الفليش) */}
      {(activeBundles.length > 0 || isCustomBundleActive) && (
        <div className="space-y-6">
          <FeaturedBundle 
            bundle={dynamicBundle} 
            bundles={activeBundles} 
            customBundleActive={isCustomBundleActive} 
          />

          {/* شبكة كافة الباقات إذا كان هناك أكثر من باقة واحدة */}
          {activeBundles.length > 1 && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <AllBundlesGrid bundles={activeBundles} />
            </div>
          )}
        </div>
      )}

      {/* 3. منتجات العروض الخاصة الفردية */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-black text-neutral-900 dark:text-white">
            منتجات العروض والتخفيضات الفردية
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            منتجات طبيعية مميزة بأسعار تفضيلية لفترة محدودة.
          </p>
        </div>

        <Suspense fallback={
          <div className="text-center py-24 text-xs text-neutral-400">
            جاري تحميل المنتجات...
          </div>
        }>
          <ShopSection categories={categories} forcedCategory="offers" />
        </Suspense>
      </div>

    </div>
  );
}

