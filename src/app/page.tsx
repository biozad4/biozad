import React from "react";
import { Hero } from "@/components/customer/Hero";
import { FeaturedBundle } from "@/components/customer/FeaturedBundle";
import { CustomBundleTopBanner } from "@/components/customer/CustomBundleTopBanner";
import { FeaturedCategories } from "@/components/customer/FeaturedCategories";
import { ProductCard } from "@/components/customer/ProductCard";
import { getFilteredProducts } from "@/app/actions/products";
import { getActiveBundles, getFeaturedBundleSettings, getCustomBundleSettings } from "@/app/actions/featuredBundle";
import { supabase } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDynamicFeaturedProducts() {
  try {
    const products = await getFilteredProducts({});
    // جلب المنتجات المميزة أولاً ثم إكمالها بالمنتجات النشطة الأخرى لعرض سطرين كاملين (8 منتجات)
    const featured = products.filter((p: any) => p.isFeatured);
    const nonFeatured = products.filter((p: any) => !p.isFeatured);
    const combined = [...featured, ...nonFeatured];
    return combined.slice(0, 8);
  } catch (error) {
    console.error("Error fetching dynamic featured products:", error);
    return [];
  }
}

export default async function HomePage() {
  // 1. جلب كافة الباقات النشطة وإعدادات الباقة المخصصة ديناميكياً من Supabase
  const [bundlesRes, customSettingsRes] = await Promise.all([
    getActiveBundles(),
    getCustomBundleSettings()
  ]);
  const activeBundles = bundlesRes.success ? (bundlesRes.bundles || []) : [];
  const dynamicBundle = activeBundles.find((b: any) => b.isFeatured) || activeBundles[0] || null;
  const isCustomBundleActive = customSettingsRes.success ? customSettingsRes.settings.isActive : false;

  // 2. جلب المنتجات المميزة ديناميكياً (8 منتجات = سطرين كل سطر 4)
  const featuredProducts = await getDynamicFeaturedProducts();

  return (
    <div className="bg-[#FAF9F6] dark:bg-neutral-950 min-h-screen">
      
      {/* 0. شريط التنبيه العلوي تحت الهيدر مباشرة (عند تفعيل باقة التشكيل) */}
      <CustomBundleTopBanner isActive={isCustomBundleActive} />

      <div className="space-y-12">
        {/* 1. البانر الترحيبي الفاخر (Hero Section) */}
        <Hero bundle={dynamicBundle} />

        {/* 2. عرض الباقات الترويجية مع إمكانية التمرير التلقائي واليدوي بالفليش */}
        <FeaturedBundle 
          bundle={dynamicBundle} 
          bundles={activeBundles} 
          customBundleActive={isCustomBundleActive} 
        />

      {/* 3. فئاتنا المميزة البصرية (Featured Categories Section) */}
      <FeaturedCategories />

      {/* 4. المنتجات الرائجة (Featured Products) - سطرين كل سطر 4 منتجات وسطر 3 فيه زر عرض الكل */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center sm:text-start mb-8 sm:mb-10">
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            أصالة وجودة
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 dark:text-white mt-1">
            مختارات مميزة لك
          </h2>
        </div>

        {/* شبكة عرض المنتجات الراقية: سطرين، كل سطر 4 منتجات (8 منتجات) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {featuredProducts.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* السطر الثالث: زر عرض الكل مركزي وفاخر */}
        <div className="mt-12 sm:mt-14 flex justify-center">
          <a
            href="/shop"
            className="group inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-emerald-700/25 dark:border-emerald-500/30 hover:border-emerald-700 dark:hover:border-emerald-500 text-neutral-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-sm sm:text-base shadow-premium-sm hover:shadow-premium-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span>عرض الكل</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
          </a>
        </div>
      </section>

      </div>
    </div>
  );
}