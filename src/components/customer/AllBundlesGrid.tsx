"use client";

import React from "react";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useFlyToCart } from "@/store/useFlyToCart";
import { useToastStore } from "@/store/useToastStore";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { Sparkles, Package, Check, ShoppingBag } from "lucide-react";

interface AllBundlesGridProps {
  bundles: any[];
}

export function AllBundlesGrid({ bundles }: AllBundlesGridProps) {
  const { lang } = useUIStore();
  const addItem = useCartStore((state) => state.addItem);
  const triggerFly = useFlyToCart((state) => state.triggerFly);
  const { showToast } = useToastStore();

  if (!bundles || bundles.length === 0) return null;

  const handleAddBundle = (bundle: any, e?: React.MouseEvent) => {
    const bundleImg = (bundle.images && bundle.images[0]) || bundle.image || "";
    triggerFly({
      image: bundleImg,
      event: e,
      startElement: (e?.currentTarget as HTMLElement) || undefined,
    });

    addItem({
      id: bundle.id || bundle._id,
      title: bundle.title,
      price: bundle.price,
      image: bundleImg,
    });

    showToast(
      lang === "ar"
        ? `✓ تم إضافة ${bundle.title.ar} إلى السلة بنجاح!`
        : `✓ ${bundle.title.fr} ajouté au panier !`,
      "success"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-900 pb-4">
        <div>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            <span>{lang === "ar" ? "باقات استثنائية جاهزة" : "Packs Clé en Main"}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-neutral-900 dark:text-white mt-1">
            {lang === "ar" ? "تشكيلة باقات المتجر التوفيرية" : "Nos Packs Économiques"}
          </h2>
        </div>
        <span className="text-xs font-semibold text-neutral-400 font-mono">
          {bundles.length} {lang === "ar" ? "باقات متوفرة" : "packs disponibles"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
          const savings = bundle.compareAtPrice && bundle.compareAtPrice > bundle.price
            ? bundle.compareAtPrice - bundle.price
            : 0;
          const items = Array.isArray(bundle.items) ? bundle.items : [];
          const mainImg = (bundle.images && bundle.images[0]) || bundle.image || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=800";

          return (
            <div
              key={bundle.id}
              className="relative rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-premium-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              {/* الصورة مع شارات التوفير والتمييز */}
              <div className="relative aspect-[16/11] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <img
                  src={mainImg}
                  alt={bundle.title?.[lang] || bundle.title?.ar}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {bundle.isFeatured && (
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="h-3 w-3 fill-current" />
                    <span>{lang === "ar" ? "الأكثر طلباً" : "Best-Seller"}</span>
                  </span>
                )}

                {savings > 0 && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md font-mono">
                    {lang === "ar" ? `وفر ${savings} د.م.` : `-${savings} DH`}
                  </span>
                )}
              </div>

              {/* التفاصيل والمحتويات */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif font-black text-lg text-neutral-900 dark:text-white line-clamp-1">
                    {bundle.title?.[lang] || bundle.title?.ar}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {bundle.description?.[lang] || bundle.description?.ar}
                  </p>
                </div>

                {/* قائمة محتويات الباقة */}
                {items.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      {lang === "ar" ? "تحتوي هذه الباقة على:" : "Ce pack contient :"}
                    </p>
                    <div className="space-y-1">
                      {items.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                          <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {item.quantity > 1 ? `${item.quantity}× ` : ""}
                            {item.title?.[lang] || item.title?.ar}
                          </span>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <p className="text-[10px] text-emerald-600 font-bold pt-0.5">
                          {lang === "ar" ? `+ ${items.length - 3} منتجات إضافية` : `+ ${items.length - 3} autres produits`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* الأسعار وزر الشراء */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-2xl font-serif font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      {bundle.price} {lang === "ar" ? "د.م." : "DH"}
                    </span>
                    {bundle.compareAtPrice && bundle.compareAtPrice > bundle.price && (
                      <span className="block text-xs text-neutral-400 line-through font-mono">
                        {bundle.compareAtPrice} {lang === "ar" ? "د.م." : "DH"}
                      </span>
                    )}
                  </div>

                  <PremiumButton
                    onClick={(e) => handleAddBundle(bundle, e)}
                    variant="primary"
                    className="px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>{lang === "ar" ? "أضف للسلة" : "Ajouter"}</span>
                  </PremiumButton>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
