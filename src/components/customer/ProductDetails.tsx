"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { PremiumButton } from "../ui/premium-button";
import { PremiumCard } from "../ui/premium-card";
import { ShoppingCart, Star, Copy, Check, Info, ArrowRight, ShieldCheck, Truck } from "lucide-react";

interface ProductDetailsProps {
  product: {
    _id: string;
    title: { ar: string; fr: string };
    price: number;
    compareAtPrice?: number;
    images: string[];
    sku: string;
    stock: number;
    description: { ar: string; fr: string };
    benefits?: { ar: string; fr: string };
    ingredients?: { ar: string; fr: string };
    usage?: { ar: string; fr: string };
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

export function ProductDetails({ product }: ProductDetailsProps) {
  const { lang } = useUIStore();
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToastStore();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const title = product.title[lang];
  const hasVariants = product.variants && product.variants.length > 0;

  // تحديد السعر النشط
  const currentPrice = hasVariants
    ? product.variants![selectedVariantIdx].price
    : product.price;

  const currentComparePrice = hasVariants
    ? product.variants![selectedVariantIdx].compareAtPrice
    : product.compareAtPrice;

  // حساب الخصم
  const discountPercentage = currentComparePrice && currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  // نسخ معرف المنتج
  const handleCopyId = () => {
    navigator.clipboard.writeText(product._id);
    setCopied(true);
    showToast(
      lang === "ar" ? "✓ تم نسخ معرف المنتج إلى الحافظة!" : "✓ ID du produit copié !",
      "success"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  // الإضافة للسلة
  const handleAddToCart = () => {
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
      lang === "ar" ? "✓ تم إضافة المنتج إلى السلة بنجاح!" : "✓ Produit ajouté au panier !",
      "success"
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* رابط العودة للمتجر */}
      <div className="flex justify-start">
        <a 
          href="/shop" 
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-primary transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
          <span>{lang === "ar" ? "العودة للمتجر" : "Retour au magasin"}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* العمود الأول: صور المنتج (5 أعمدة) */}
        <div className="lg:col-span-5 space-y-4">
          <PremiumCard hoverEffect={false} className="p-4 overflow-hidden rounded-[2rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-premium-lg">
            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={product.images[0] || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800"}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          </PremiumCard>

          {/* صور مصغرة إضافية إذا وجدت */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square border rounded-xl overflow-hidden bg-white dark:bg-neutral-900 cursor-pointer p-1">
                  <img src={img} alt="" className="h-full w-full object-cover rounded-lg" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* العمود الثاني: معلومات المنتج والتفاعل (7 أعمدة) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            {/* القسم الموجه */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold text-accent uppercase tracking-wider">
              {lang === "ar" ? "منتج طبيعي فاخر 100%" : "Produit Naturel 100%"}
            </span>

            {/* الاسم التفاعلي */}
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white leading-tight">
              {title}
            </h1>

            {/* التقييم */}
            <div className="flex items-center gap-1.5 text-amber-500">
              <Star className="h-4.5 w-4.5 fill-current" />
              <span className="text-xs font-bold text-neutral-500">4.9 (45 {lang === "ar" ? "تقييم حقيقي من زبائننا" : "avis vérifiés"})</span>
            </div>
          </div>

          {/* تفاصيل الأسعار والخصومات */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl flex items-center justify-between shadow-premium-sm">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">
                {lang === "ar" ? "السعر الحالي للتوصيل الفوري" : "Prix actuel"}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-serif font-black text-primary dark:text-accent font-mono">
                  {currentPrice} {lang === "ar" ? "د.م." : "DH"}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-sm text-neutral-400 line-through font-mono">
                    {currentComparePrice} {lang === "ar" ? "د.م." : "DH"}
                  </span>
                )}
              </div>
            </div>

            {discountPercentage > 0 && (
              <span className="bg-accent text-white text-xs font-bold px-3.5 py-1.5 rounded-full tracking-wide uppercase">
                {lang === "ar" ? `وفر ${discountPercentage}%` : `Économisez ${discountPercentage}%`}
              </span>
            )}
          </div>

          {/* اختيار الأوزان / الأحجام المتنوعة */}
          {hasVariants && (
            <div className="space-y-3 p-5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                {lang === "ar" ? "اختر الوزن / الحجم المطلوب:" : "Choisir le format :"}
              </h4>
              <div className="flex gap-2.5 justify-start flex-wrap">
                {product.variants!.map((v, idx) => (
                  <button
                    key={v.sku}
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`px-4 py-3 text-xs font-bold border rounded-xl flex items-center gap-2 transition-all ${
                      selectedVariantIdx === idx
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20 dark:border-accent dark:bg-accent/5 dark:text-accent"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950"
                    }`}
                  >
                    {selectedVariantIdx === idx && <Check className="h-4 w-4 text-primary dark:text-accent" />}
                    <span>{v.weight}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* الأزرار التفاعلية للإجراءات */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* زر الإضافة للسلة */}
            <PremiumButton
              onClick={handleAddToCart}
              variant="primary"
              className="flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-premium-md"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{lang === "ar" ? "أضف هذا المنتج إلى السلة" : "Ajouter au Panier"}</span>
            </PremiumButton>

            {/* زر معرف المنتج (ID) ونسخه */}
            <button
              onClick={handleCopyId}
              className="px-6 py-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              title={lang === "ar" ? "نسخ معرف المنتج الفريد" : "Copier l'ID du produit"}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              <span>{lang === "ar" ? "معرّف المنتج (ID)" : "ID du Produit"}</span>
              <span className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                {product._id.substring(0, 8)}...
              </span>
            </button>
          </div>

          {/* المميزات الترويحية السريعة */}
          <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 dark:border-neutral-900 pt-6">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold">{lang === "ar" ? "شحن سريع وآمن" : "Livraison Rapide"}</h5>
                <p className="text-[10px] text-neutral-400">{lang === "ar" ? "لكافة المدن المغربية 48 ساعة" : "Dans tout le Maroc en 48h"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold">{lang === "ar" ? "ضمان الجودة والنقاء" : "Qualité Garantie"}</h5>
                <p className="text-[10px] text-neutral-400">{lang === "ar" ? "طبيعي وبكر ممتاز 100%" : "Pure & Bio d'exception"}</p>
              </div>
            </div>
          </div>

          {/* تفاصيل ووصف السلعة */}
          <div className="space-y-3 border-t border-neutral-100 dark:border-neutral-900 pt-6">
            <h3 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-100">
              {lang === "ar" ? "وصف ومواصفات المنتج:" : "Description du produit :"}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {product.description[lang] || (lang === "ar" ? "وصف منتج BioZad الطبيعي والفاخر من قلب المغرب." : "Description premium du produit BioZad.")}
            </p>
          </div>

          {/* الفوائد وطرق الاستخدام (اختياري) */}
          {product.benefits?.[lang] && (
            <div className="space-y-2 bg-neutral-50/50 dark:bg-neutral-900/20 p-5 rounded-2xl border border-neutral-100/50 dark:border-neutral-900">
              <h4 className="font-serif text-sm font-bold text-primary dark:text-accent">
                {lang === "ar" ? "المنافع والخصائص الأساسية:" : "Bénéfices & Propriétés :"}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                {product.benefits[lang]}
              </p>
            </div>
          )}

        </div>

      </div>
      
    </div>
  );
}
