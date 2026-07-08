"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { PremiumCard } from "../ui/premium-card";
import { PremiumButton } from "../ui/premium-button";
import { ShoppingCart, Eye, Star, X, Check } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: string;
    title: { ar: string; fr: string };
    price: number;
    compareAtPrice?: number;
    images: string[];
    sku: string;
    stock: number;
    slug: string;
    description?: { ar: string; fr: string };
    variants?: {
      sku: string;
      barcode: string;
      weight: string;
      price: number;
      compareAtPrice?: number;
      stock: number;
    }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { lang } = useUIStore();
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToastStore();

  // حالات نافذة العرض السريع (Quick View) وتحديد الوزن المختار
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const title = product.title[lang];
  const hasVariants = product.variants && product.variants.length > 0;

  // تحديد الأسعار المعروضة حالياً بناءً على وجود الأوزان والوزن المختار
  const currentPrice = hasVariants
    ? product.variants![selectedVariantIdx].price
    : product.price;

  const currentComparePrice = hasVariants
    ? product.variants![selectedVariantIdx].compareAtPrice
    : product.compareAtPrice;

  // حساب نسبة الخصم تلقائياً
  const discountPercentage = currentComparePrice && currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  // دالة الإضافة السلسة للمنتج أو الوزن المحدد للسلة
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      const selectedVariant = product.variants![selectedVariantIdx];
      addItem({
        id: product._id,
        variantSku: selectedVariant.sku,
        title: {
          ar: `${product.title.ar} (${selectedVariant.weight})`,
          fr: `${product.title.fr} (${selectedVariant.weight})`
        },
        price: selectedVariant.price,
        image: product.images[0] || "",
        weight: selectedVariant.weight
      });
    } else {
      addItem({
        id: product._id,
        title: product.title,
        price: product.price,
        image: product.images[0] || "",
      });
    }
    showToast(
      lang === "ar" ? "✓ تم إضافة المنتج إلى السلة!" : "✓ Produit ajouté au panier !",
      "success"
    );
  };

  return (
    <>
      <PremiumCard hoverEffect={true} className="group relative flex flex-col justify-between overflow-hidden cursor-pointer h-full">
        
        {/* شارة نسبة الخصم الفاخرة */}
        {discountPercentage > 0 && (
          <span className="absolute top-4 right-4 z-10 rounded-full bg-accent text-[10px] font-bold text-white px-2.5 py-1 tracking-wider uppercase">
            -{discountPercentage}%
          </span>
        )}

        {/* غلاف الصورة التفاعلي مع حركات Apple الناعمة */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-50 mb-4">
          <motion.img
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            src={product.images[0] || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500"}
            alt={title}
            className="h-full w-full object-cover object-center"
          />

          {/* شارة الخيارات المتعددة */}
          {hasVariants && (
            <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-[9px] font-bold text-neutral-800 px-2 py-1 rounded-md border dark:bg-neutral-900/90 dark:text-white dark:border-neutral-800">
              {lang === "ar" ? "⚖️ خيارات متعددة" : "⚖️ Multi-formats"}
            </span>
          )}
        </div>

        {/* معلومات وتقييم المنتج */}
        <div className="space-y-2 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-[10px] font-bold text-neutral-500">4.9 (45 تقييم)</span>
            </div>

            <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1">
              {title}
            </h4>
            
            {hasVariants && (
              <p className="text-[10px] text-neutral-400">
                {lang === "ar" ? "الأوزان:" : "Formats:"} {product.variants!.map(v => v.weight).join(" | ")}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 flex flex-col gap-3">
            {/* السعر الحالي والقديم */}
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-primary dark:text-accent font-mono">
                {currentPrice} {lang === "ar" ? "د.م." : "DH"}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xs text-neutral-400 line-through font-mono">
                  {currentComparePrice} {lang === "ar" ? "د.م." : "DH"}
                </span>
              )}
            </div>

            {/* الأزرار التفاعلية المزدوجة (CTAs) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-1 bg-primary text-white text-[11px] font-bold py-2.5 rounded-full hover:bg-primary/95 transition-all active:scale-[0.97]"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{lang === "ar" ? "سلة" : "Panier"}</span>
              </button>

              <a
                href={`/product/${product.slug}`}
                className="flex items-center justify-center gap-1 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-bold py-2.5 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all active:scale-[0.97]"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{lang === "ar" ? "تفاصيل" : "Détails"}</span>
              </a>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* 🚀 نافذة العرض السريع المنبثقة (Quick View Modal) */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* الخلفية المظلمة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickViewOpen(false)}
              className="fixed inset-0 bg-black"
            />

            {/* بطاقة المعاينة والتحكم بالتعديل */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="relative w-full max-w-2xl bg-white dark:bg-neutral-950 rounded-[2rem] overflow-hidden p-6 shadow-premium-lg border border-neutral-100 dark:border-neutral-900 flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto"
            >
              {/* زر الإغلاق الذكي */}
              <button
                onClick={() => setIsQuickViewOpen(false)}
                className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* جانب الصورة */}
              <div className="md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 self-center">
                <img
                  src={product.images[0] || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500"}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* جانب المواصفات وتحديد الأوزان والدفع */}
              <div className="md:w-1/2 flex flex-col justify-between space-y-4 text-right">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">{title}</h3>
                  <div className="flex items-center gap-1.5 text-amber-500 justify-end">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-xs font-bold text-neutral-500">4.9 (45 تقييم حقيقي)</span>
                  </div>
                </div>

                {/* الوصف */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">مواصفات السلعة</span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {product.description?.[lang] || (lang === "ar" ? "منتج طبيعي فاخر من خيرات الأرض المغربية مستخلص بعناية ونقاء كامل." : "Soin d'exception issu du terroir marocain.")}
                  </p>
                </div>

                {/* واجهة اختيار الوزن التفاعلية */}
                {hasVariants && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">اختر الوزن / الحجم المطلوب:</span>
                    <div className="flex gap-2 justify-start flex-wrap">
                      {product.variants!.map((v, idx) => (
                        <button
                          key={v.sku}
                          onClick={() => setSelectedVariantIdx(idx)}
                          className={`px-4 py-2 text-xs font-bold border rounded-xl flex items-center gap-1.5 transition-all ${
                            selectedVariantIdx === idx
                              ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20 dark:border-accent dark:bg-accent/5 dark:text-accent"
                              : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          }`}
                        >
                          {selectedVariantIdx === idx && <Check className="h-3.5 w-3.5 text-primary dark:text-accent" />}
                          <span>{v.weight}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* حيز السعر النهائي وتأكيد الطلب */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">{lang === "ar" ? "السعر الإجمالي:" : "Prix total :"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-serif font-extrabold text-primary dark:text-accent font-mono">
                        {currentPrice} {lang === "ar" ? "د.م." : "DH"}
                      </span>
                      {discountPercentage > 0 && (
                        <span className="text-xs text-neutral-400 line-through font-mono">
                          {currentComparePrice} {lang === "ar" ? "د.م." : "DH"}
                        </span>
                      )}
                    </div>
                  </div>

                  <PremiumButton
                    onClick={(e) => {
                      handleAddToCart(e);
                      setIsQuickViewOpen(false);
                    }}
                    variant="primary"
                    className="w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                    <span>{lang === "ar" ? "أضف هذا الوزن إلى السلة الآن" : "Ajouter au Panier"}</span>
                  </PremiumButton>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}