import React from "react";
import { Hero } from "@/components/customer/Hero";
import { FeaturedBundle } from "@/components/customer/FeaturedBundle";
import { FeaturedCategories } from "@/components/customer/FeaturedCategories";
import { ProductCard } from "@/components/customer/ProductCard";
import { getFilteredProducts } from "@/app/actions/products";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { FeaturedBundleModel } from "@/models/FeaturedBundle";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDynamicBundle() {
  try {
    await connectDB();
    const bundle = await FeaturedBundleModel.findOne({ isActive: true }).lean();
    return bundle ? JSON.parse(JSON.stringify(bundle)) : null;
  } catch (error) {
    console.error("Error fetching dynamic bundle:", error);
    return null;
  }
}

async function getDynamicFeaturedProducts() {
  try {
    await connectDB();
    const featured = await Product.find({ isActive: true, isFeatured: true }).limit(4).lean();
    return JSON.parse(JSON.stringify(featured));
  } catch (error) {
    console.error("Error fetching dynamic featured products:", error);
    return [];
  }
}

export default async function HomePage() {
  // 1. جلب باقة السعادة المميزة ديناميكياً من قاعدة البيانات
  const dynamicBundle = await getDynamicBundle();

  // 2. جلب المنتجات المميزة ديناميكياً من قاعدة البيانات
  let featuredProducts = await getDynamicFeaturedProducts();

  // 3. في حال عدم قيام المشرف بتحديد منتجات مميزة، نقوم بالسحب الاحتياطي لأحدث 4 سلع
  if (!featuredProducts || featuredProducts.length === 0) {
    const products = await getFilteredProducts({ sortBy: "newest" });
    featuredProducts = products.slice(0, 4);
  }

  return (
    <div className="bg-[#FAF9F6] dark:bg-neutral-950 min-h-screen space-y-12">
      
      {/* 1. البانر الترحيبي الفاخر (Hero Section) */}
      <Hero bundle={dynamicBundle} />

      {/* 2. عرض الباقة الترويجية المميزة (Featured Bundle Section - Dynamic) */}
      <FeaturedBundle bundle={dynamicBundle} />

      {/* 3. فئاتنا المميزة البصرية (Featured Categories Section) */}
      <FeaturedCategories />

      {/* 4. المنتجات المميزة الأكثر مبيعاً (Curated Product Grid - Dynamic) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-accent uppercase tracking-wider">
            ✨ منتجات منتقاة بعناية
          </span>
          <h2 className="font-serif text-3xl font-black text-neutral-900 dark:text-white">
            منتجات مميزة الأكثر طلباً
          </h2>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            تصفح التشكيلة المختارة من سلع BioZad الطبيعية والفاخرة بنسبة 100% الأكثر طلباً وتقييماً.
          </p>
        </div>

        {/* شبكة المنتجات (4 أعمدة) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* زر عرض كامل التشكيلة */}
        <div className="flex justify-center pt-4">
          <a
            href="/shop#products"
            className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary/95 px-8 py-4 rounded-full text-xs font-bold shadow-premium-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>عرض المزيد من المنتجات (المعرض الفاخر)</span>
            <ArrowRight className="h-4.5 w-4.5 rotate-180 rtl:rotate-0" />
          </a>
        </div>
      </section>

    </div>
  );
}