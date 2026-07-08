"use client";

import React from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { PremiumButton } from "../ui/premium-button";
import { Sparkles, Truck, ShieldCheck, Gift } from "lucide-react";

interface FeaturedBundleProps {
  bundle?: any;
}

export function FeaturedBundle({ bundle }: FeaturedBundleProps) {
  const { lang } = useUIStore();
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToastStore();

  const hasBundle = !!bundle;
  const id = hasBundle ? bundle._id : "biozad-happiness-bundle";
  
  const title = hasBundle ? bundle.title : {
    ar: "باقة السعادة الشاملة (عرض خاص)",
    fr: "Pack Bonheur BioZad (Offre Spéciale)"
  };
  
  const price = hasBundle ? bundle.price : 450;
  const compareAtPrice = hasBundle ? bundle.compareAtPrice : 550;
  
  const image = hasBundle
    ? (bundle.image || (bundle.images && bundle.images[0]) || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=800")
    : "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=800";
    
  const description = hasBundle ? bundle.description[lang] : "";

  // حساب التوفير المالي
  const savings = (compareAtPrice && compareAtPrice > price) ? (compareAtPrice - price) : 0;

  const handleAddBundle = () => {
    addItem({
      id,
      title,
      price,
      image,
    });
    
    showToast(
      lang === "ar" 
        ? `✓ تم إضافة ${title.ar} إلى السلة بنجاح!` 
        : `✓ ${title.fr} ajouté au panier !`,
      "success"
    );
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-primary/10 via-white to-accent/5 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900/40 p-5 sm:p-8 md:p-16 border border-primary/10 overflow-hidden shadow-premium-lg">
        
        {/* نقوش تزيينية خلفية */}
        <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center relative z-10">
          
          {/* العمود الأول: صورة الباقة الجمالية (6 أعمدة) */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-premium-xl bg-white border border-neutral-100 dark:border-neutral-900 p-2 sm:p-3.5 hover:scale-[1.02] transition-transform duration-500">
              <img 
                src={image} 
                alt={title[lang]} 
                className="h-full w-full object-cover rounded-xl sm:rounded-[1.5rem]"
              />
              <span className="absolute top-6 sm:top-8 right-6 sm:right-8 bg-accent text-white text-[10px] font-black uppercase tracking-wider px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-premium-sm flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>{lang === "ar" ? "عرض خاص وحصري" : "OFFRE CHOC"}</span>
              </span>
            </div>
          </div>

          {/* العمود الثاني: نصوص الباقة وتفاصيلها (6 أعمدة) */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-7">
            <div className="space-y-2 sm:space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                {lang === "ar" ? "توفير خاص ومميز" : "OFFRE SPÉCIALE"}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4.5xl font-black text-neutral-900 dark:text-white leading-tight">
                {title[lang]}
              </h2>
              {!hasBundle && (
                <p className="text-xs text-neutral-400">
                  {lang === "ar" ? "تشكيلة منسقة بعناية من أفضل ما يجود به terroir المغربي لتقديم السعادة والصحة لعائلتك." : "Une sélection haut de gamme pour le bien-être et la vitalité de votre famille."}
                </p>
              )}
            </div>

            {/* محتويات الباقة */}
            <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-900 rounded-[1.25rem] sm:rounded-[1.5rem] p-4 sm:p-6 space-y-3 sm:space-y-4">
              <h4 className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider">
                {lang === "ar" ? "📦 تفاصيل ومحتويات هذا العرض:" : "📦 Détails de cette offre :"}
              </h4>
              {hasBundle ? (
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🍯</span>
                    <span><strong>1 كجم</strong> {lang === "ar" ? "عسل الزهور الطبيعي الحر" : "Miel de Fleurs Sauvages"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🥜</span>
                    <span><strong>1 كجم</strong> {lang === "ar" ? "أملو اللوز البلدي والعسل الحر" : "Amlou d'Amandes & Miel Pure"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🌰</span>
                    <span><strong>500 مل</strong> {lang === "ar" ? "زيت أركان البكر الممتاز للأكل" : "Huile d'Argan Culinaire Pure"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🍵</span>
                    <span><strong>250 غرام</strong> {lang === "ar" ? "شاي ملكي أصيل بالأعشاب" : "Thé Royal Traditionnel"}</span>
                  </li>
                </ul>
              )}
            </div>

            {/* مميزات الخدمة */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/50 dark:bg-neutral-900/20 border border-neutral-100/50 dark:border-neutral-900 rounded-2xl space-y-1.5">
                <Truck className="h-5 w-5 text-accent mx-auto shrink-0" />
                <h5 className="text-[11px] font-bold">{lang === "ar" ? "توصيل مجاني" : "Livraison Gratuite"}</h5>
              </div>
              <div className="p-4 bg-white/50 dark:bg-neutral-900/20 border border-neutral-100/50 dark:border-neutral-900 rounded-2xl space-y-1.5">
                <ShieldCheck className="h-5 w-5 text-accent mx-auto shrink-0" />
                <h5 className="text-[11px] font-bold">{lang === "ar" ? "نقاء مضمون 100%" : "Pureté Garantie"}</h5>
              </div>
              <div className="p-4 bg-white/50 dark:bg-neutral-900/20 border border-neutral-100/50 dark:border-neutral-900 rounded-2xl space-y-1.5">
                <Gift className="h-5 w-5 text-accent mx-auto shrink-0" />
                <h5 className="text-[11px] font-bold">{lang === "ar" ? "تغليف هدايا راقٍ" : "Emballage Cadeau"}</h5>
              </div>
            </div>

            {/* السعر والـ CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-3 border-t border-neutral-100 dark:border-neutral-900">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-serif font-black text-primary dark:text-accent font-mono">
                  {price} {lang === "ar" ? "د.م." : "DH"}
                </span>
                {compareAtPrice && compareAtPrice > price && (
                  <>
                    <span className="text-base text-neutral-400 line-through font-mono">
                      {compareAtPrice} {lang === "ar" ? "د.م." : "DH"}
                    </span>
                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                      {lang === "ar" ? `وفر ${savings} د.م.` : `ÉCONOMISEZ ${savings} DH`}
                    </span>
                  </>
                )}
              </div>

              <PremiumButton
                onClick={handleAddBundle}
                variant="primary"
                className="w-full sm:w-auto px-10 py-4.5 text-sm font-bold flex items-center justify-center gap-2 shadow-premium-md animate-pulse"
              >
                <span>{lang === "ar" ? "أضف هذا العرض إلى السلة" : "Ajouter cette offre au panier"}</span>
              </PremiumButton>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
