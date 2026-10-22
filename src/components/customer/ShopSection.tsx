"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useUIStore } from "@/store/useUIStore";
import { useSearchParams, useRouter } from "next/navigation"; // استيراد أدوات التحكم بالرابط
import { getFilteredProducts } from "@/app/actions/products";
import { ProductCard } from "./ProductCard";
import { PremiumSkeleton } from "../ui/premium-skeleton";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface CategoryOption {
  slug: string;
  name: { ar: string; fr: string };
}

interface ShopSectionProps {
  categories: CategoryOption[];
  forcedCategory?: string;
}

export function ShopSection({ categories, forcedCategory }: ShopSectionProps) {
  const { lang } = useUIStore();
  const searchParams = useSearchParams(); // خطاف قراءة الرابط
  const router = useRouter(); // خطاف تحديث الرابط

  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<any[]>([]);

  // قراءة الفئة الافتراضية من الرابط إن وجدت (مثال: ?category=amlou)
  const categoryParam = forcedCategory || searchParams.get("category") || "";

  // الحالات المتحكمة بالفلترة والبحث
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest");

  // مزامنة حالة الفلتر فور تغير رابط الصفحة (مثلاً عند التنقل من القائمة المنسدلة)
  useEffect(() => {
    setSelectedCategory(forcedCategory || categoryParam);
  }, [categoryParam, forcedCategory]);

  // دالة تحديث المنتجات وجلبها من الخادم
  const updateProducts = () => {
    startTransition(async () => {
      const data = await getFilteredProducts({
        search: searchQuery || undefined,
        categorySlug: selectedCategory || undefined,
        sortBy: sortBy,
      });
      setProducts(data);
    });
  };

  // تشغيل الفلترة مباشرة عند تغيير أي حالة للبحث أو الفئة أو الترتيب
  useEffect(() => {
    updateProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  // دالة ذكية لتحديث الفئة وتغيير الرابط في الأعلى دون إعادة تحميل الصفحة
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug) {
      router.push(`/shop?category=${slug}`, { scroll: false });
    } else {
      router.push(`/shop`, { scroll: false });
    }
  };

  return (
    <div id="products" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* لوحة التحكم بالفلاتر والبحث (Premium Filter Panel) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-6">
        
        {/* شريط البحث الفاخر */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن المنتج الفاخر المناسب لك..." : "Rechercher votre soin d'exception..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-neutral-200/70 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>


        {/* فرز ترتيب المنتجات */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-neutral-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="rounded-full border border-neutral-200/70 bg-white dark:bg-neutral-900 py-2 px-4 text-xs font-semibold focus:outline-none"
          >
            <option value="newest">{lang === "ar" ? "الأحدث" : "Plus Récents"}</option>
            <option value="price_asc">{lang === "ar" ? "السعر: من الأقل للأعلى" : "Prix: Bas à Élevé"}</option>
            <option value="price_desc">{lang === "ar" ? "السعر: من الأعلى للأقل" : "Prix: Élevé à Bas"}</option>
          </select>
        </div>
      </div>

      {/* شبكة عرض المنتجات */}
      <div>
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="space-y-4 p-5 border border-neutral-100 dark:border-neutral-900 rounded-[1.25rem]">
                <PremiumSkeleton className="aspect-square w-full rounded-xl" />
                <PremiumSkeleton className="h-4 w-3/4 rounded-full" />
                <PremiumSkeleton className="h-4 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4 max-w-md mx-auto">
            <SlidersHorizontal className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
            <p className="text-neutral-500 font-medium">
              {lang === "ar" ? "لم نجد أي منتجات تطابق خيارات التصفية هذه." : "Aucun produit trouvé pour ces critères."}
            </p>
            {selectedCategory === "offers" && (
              <a
                href="/offers"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
              >
                <span>{lang === "ar" ? "تصفح باقات وعروض المتجر الحصرية" : "Découvrir nos packs et offres"}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}