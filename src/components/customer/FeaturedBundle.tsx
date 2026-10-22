"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useFlyToCart } from "@/store/useFlyToCart";
import { useToastStore } from "@/store/useToastStore";
import { PremiumButton } from "../ui/premium-button";
import { 
  Sparkles, Truck, ShieldCheck, Gift, ArrowRight, 
  CheckCircle2, Package, Sliders, Layers, ChevronLeft, ChevronRight,
  SlidersHorizontal, TrendingDown, Percent, PackageCheck
} from "lucide-react";
import Link from "next/link";

interface FeaturedBundleProps {
  bundle?: any;
  bundles?: any[];
  customBundleActive?: boolean;
}

export function FeaturedBundle({ bundle, bundles, customBundleActive = false }: FeaturedBundleProps) {
  const { lang } = useUIStore();
  const addItem = useCartStore((state) => state.addItem);
  const triggerFly = useFlyToCart((state) => state.triggerFly);
  const { showToast } = useToastStore();

  // تصفية وتجميع كافة الباقات الجاهزة النشطة
  const bundleList: any[] = (bundles && bundles.length > 0)
    ? bundles.filter((b: any) => b && b.isActive !== false)
    : (bundle && bundle.isActive !== false ? [bundle] : []);

  const hasPresetBundle = bundleList.length > 0;
  const isCustomActive = !!customBundleActive;

  // إذا لم تكن هناك أي باقة مفعلة (لا باقة جاهزة ولا باقة مخصصة)، لا نعرض أي شيء نهائياً
  if (!hasPresetBundle && !isCustomActive) {
    return null;
  }

  // مؤشر الباقة الحالية من قائمة الباقات المتعددة
  const initialFeaturedIdx = bundleList.findIndex((b: any) => b.isFeatured);
  const [currentIndex, setCurrentIndex] = useState(initialFeaturedIdx >= 0 ? initialFeaturedIdx : 0);
  const [isPaused, setIsPaused] = useState(false);

  // أمان الفهرس
  const activeIdx = Math.min(currentIndex, Math.max(0, bundleList.length - 1));
  const currentBundle = bundleList[activeIdx] || bundleList[0];

  // تدوير الباقات تلقائياً كل 5.5 ثوانٍ عند وجود أكثر من باقة واحدة (مع التوقف عند وضع الماوس)
  useEffect(() => {
    if (bundleList.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bundleList.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [bundleList.length, isPaused]);

  // إعدادات الباقة المعروضة حالياً
  const id = currentBundle?._id || currentBundle?.id;
  const title = currentBundle?.title || { ar: "", fr: "" };
  const price = currentBundle?.price || 0;
  const compareAtPrice = currentBundle?.compareAtPrice;
  const image = currentBundle?.image || "";
  const bundleImages: string[] = Array.isArray(currentBundle?.images) && currentBundle.images.length > 0
    ? currentBundle.images
    : (currentBundle?.image ? [currentBundle.image] : []);
  const [selectedImage, setSelectedImage] = useState<string>(bundleImages[0] || image);

  // مزامنة الصورة المصغرة عند تغير الباقة الحالية
  useEffect(() => {
    setSelectedImage(bundleImages[0] || image);
  }, [id, currentBundle?.image, bundleImages[0]]);

  const description = currentBundle?.description?.[lang] || "";
  const items = Array.isArray(currentBundle?.items) ? currentBundle.items : [];
  const savings = (compareAtPrice && compareAtPrice > price) ? (compareAtPrice - price) : 0;

  // دوال التنقل اليدوي بالفليش
  const handleNextBundle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % bundleList.length);
  };

  const handlePrevBundle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + bundleList.length) % bundleList.length);
  };

  const handleAddPresetBundle = (e?: React.MouseEvent) => {
    if (!currentBundle) return;

    const bundleImg = selectedImage || image;
    triggerFly({
      image: bundleImg,
      event: e,
      startElement: (e?.currentTarget as HTMLElement) || undefined,
    });

    addItem({
      id,
      title,
      price,
      image: bundleImg,
    });
    
    showToast(
      lang === "ar" 
        ? `✓ تم إضافة ${title.ar} إلى السلة بنجاح!` 
        : `✓ ${title.fr} ajouté au panier !`,
      "success"
    );
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
      
      {/* ========================================================================= */}
      {/* 1. عرض باقات المتجر الجاهزة (Preset Bundles View) مع التمرير التلقائي وأزرار الفليش */}
      {/* ========================================================================= */}
      {hasPresetBundle && (
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-primary/10 via-white to-accent/5 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900/40 p-5 sm:p-8 md:p-14 border border-primary/10 overflow-hidden shadow-premium-lg group"
        >
          <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

          {/* فليش التمرير السريع الجانبي (Side Floating Arrows) */}
          {bundleList.length > 1 && (
            <>
              {/* زر السابق (فليش اليمين بالعربية) */}
              <button
                type="button"
                onClick={lang === "ar" ? handlePrevBundle : handleNextBundle}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-100 shadow-premium-md hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 border border-neutral-200/80 dark:border-neutral-700 backdrop-blur-md"
                title={lang === "ar" ? "الباقة السابقة" : "Pack précédent"}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* زر التالي (فليش اليسار بالعربية) */}
              <button
                type="button"
                onClick={lang === "ar" ? handleNextBundle : handlePrevBundle}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-100 shadow-premium-md hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 border border-neutral-200/80 dark:border-neutral-700 backdrop-blur-md"
                title={lang === "ar" ? "الباقة التالية" : "Pack suivant"}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </>
          )}

          {/* شريط التحكم بالباقات المتعددة والترقيم بالأعلى */}
          {bundleList.length > 1 && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200/60 dark:border-neutral-800/60 relative z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/70 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
                  <Package className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{lang === "ar" ? `باقة ${activeIdx + 1} من ${bundleList.length}` : `Pack ${activeIdx + 1} / ${bundleList.length}`}</span>
                </span>
                {currentBundle.isFeatured && (
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{lang === "ar" ? "المفضلة ⭐" : "Vedette ⭐"}</span>
                  </span>
                )}
              </div>

              {/* مؤشرات النقاط Clickable Dots */}
              <div className="flex items-center gap-1.5">
                {bundleList.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIdx === idx
                        ? "w-6 bg-emerald-600 dark:bg-emerald-400"
                        : "w-2 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400"
                    }`}
                    title={b.title?.[lang] || b.title?.ar}
                  />
                ))}
              </div>
            </div>
          )}

          {/* محتوى الباقة مع حركة انتقالية ناعمة */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBundle?.id || activeIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center relative z-10"
            >
              
              {/* الصورة الجمالية ومعرض الصور المصغرة */}
              <div className="lg:col-span-6 flex flex-col items-center gap-3">
                <div className="relative w-full max-w-md aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-premium-xl bg-white border border-neutral-100 dark:border-neutral-900 p-2 sm:p-3.5 hover:scale-[1.01] transition-transform duration-500">
                  <img 
                    src={selectedImage || image} 
                    alt={title[lang]} 
                    className="h-full w-full object-cover rounded-xl sm:rounded-[1.5rem]"
                  />
                  <span className="absolute top-6 sm:top-8 right-6 sm:right-8 bg-accent text-white text-[10px] font-black uppercase tracking-wider px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-premium-sm flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>{lang === "ar" ? "عرض حصري وخاص" : "OFFRE CHOC"}</span>
                  </span>
                </div>

                {/* مصغرات التبديل في حال وجود عدة صور للباقة */}
                {bundleImages.length > 1 && (
                  <div className="flex items-center justify-center gap-2 max-w-md overflow-x-auto p-1">
                    {bundleImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`relative h-12 w-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          selectedImage === img
                            ? "border-primary ring-2 ring-primary/30 scale-105"
                            : "border-neutral-200 dark:border-neutral-700 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt={`صورة ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* النصوص والتفاصيل */}
              <div className="lg:col-span-6 space-y-5 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                    {lang === "ar" ? "توفير خاص ومميز" : "OFFRE SPÉCIALE"}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4.5xl font-black text-neutral-900 dark:text-white leading-tight">
                    {title[lang]}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* المنتجات المكونة */}
                <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 rounded-[1.5rem] p-4 sm:p-5 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <span>📦</span>
                    <span>{lang === "ar" ? "محتويات وتفاصيل هذا العرض:" : "Détails de cette offre :"}</span>
                  </h4>

                  {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-100 dark:border-neutral-800 shadow-xs"
                        >
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=100"}
                            alt={item.title?.ar || ""}
                            className="h-10 w-10 rounded-lg object-cover border shrink-0"
                          />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                              {item.title?.[lang] || item.title?.ar}
                            </p>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {item.quantity > 1 ? `×${item.quantity} • ` : ""}
                              {item.weight || (lang === "ar" ? "حجم أصلي" : "Format standard")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  )}
                </div>

                {/* مميزات الخدمة */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 sm:p-4 bg-white/50 dark:bg-neutral-900/20 border border-neutral-100/50 dark:border-neutral-900 rounded-2xl space-y-1">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-accent mx-auto shrink-0" />
                    <h5 className="text-[10px] sm:text-[11px] font-bold">{lang === "ar" ? "توصيل مجاني" : "Livraison Gratuite"}</h5>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/50 dark:bg-neutral-900/20 border border-neutral-100/50 dark:border-neutral-900 rounded-2xl space-y-1">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-accent mx-auto shrink-0" />
                    <h5 className="text-[10px] sm:text-[11px] font-bold">{lang === "ar" ? "نقاء مضمون 100%" : "Pureté Garantie"}</h5>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/50 dark:bg-neutral-900/20 border border-neutral-100/50 dark:border-neutral-900 rounded-2xl space-y-1">
                    <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-accent mx-auto shrink-0" />
                    <h5 className="text-[10px] sm:text-[11px] font-bold">{lang === "ar" ? "تغليف هدايا راقٍ" : "Emballage Cadeau"}</h5>
                  </div>
                </div>

                {/* السعر والـ CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-3 border-t border-neutral-100 dark:border-neutral-900">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-serif font-black text-primary dark:text-accent font-mono">
                      {price} {lang === "ar" ? "د.م." : "DH"}
                    </span>
                    {compareAtPrice && compareAtPrice > price && (
                      <>
                        <span className="text-sm sm:text-base text-neutral-400 line-through font-mono">
                          {compareAtPrice} {lang === "ar" ? "د.م." : "DH"}
                        </span>
                        <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {lang === "ar" ? `وفر ${savings} د.م.` : `ÉCONOMISEZ ${savings} DH`}
                        </span>
                      </>
                    )}
                  </div>

                  <PremiumButton
                    onClick={handleAddPresetBundle}
                    variant="primary"
                    className="w-full sm:w-auto px-8 py-4 text-xs font-bold flex items-center justify-center gap-2 shadow-premium-md"
                  >
                    <span>{lang === "ar" ? "أضف هذا العرض إلى السلة" : "Ajouter cette offre au panier"}</span>
                  </PremiumButton>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. تجربة "شكّل باقتك الفاخرة بنفسك" (Custom Bundle Builder Section) */}
      {/* تظهر تحت الباقات الجاهزة مباشرة بتصميم فخم ومطور يضفي لمسة راقية */}
      {/* ========================================================================= */}
      {isCustomActive && (
        <div className="relative rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-[#0a2318] via-[#103825] to-[#071a12] p-6 sm:p-10 md:p-14 text-white border border-emerald-500/25 overflow-hidden shadow-premium-xl">
          
          {/* إضاءات جمالية ناعمة */}
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center relative z-10">
            
            {/* العمود الأول: الشرح، سلم التخفيض، والمميزات */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[11px] font-black text-amber-300 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                  <span>{lang === "ar" ? "تجربة حصرية • حرية تامة" : "EXPÉRIENCE SUR-MESURE"}</span>
                  <span className="bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full text-[9px] font-black">
                    OFFRE VIP
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl md:text-4.5xl font-black text-white leading-tight">
                  {lang === "ar" ? "شكّل باقتك الفاخرة على ذوقك" : "Composez Votre Pack Sur-Mesure"}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                  {lang === "ar"
                    ? "اختر ما يناسبك من منتجاتنا البلدية المضمونة (عسل حر، أملو، أركان، شاي)، واستفد من تخفيض فوري متصاعد يرتفع تلقائياً كلما زادت قيمة باقتك!"
                    : "Sélectionnez vos soins et délices marocains préférés et profitez de réductions progressives immédiates jusqu'à 15% !"}
                </p>
              </div>

              {/* سلم التخفيض التدريجي الفوري */}
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2.5">
                <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="h-3.5 w-3.5" />
                  <span>{lang === "ar" ? "سلّم التخفيض الفوري التلقائي:" : "Barème des remises automatiques :"}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-neutral-300 font-semibold">{lang === "ar" ? "مجموع 300 د.م. فأكثر" : "Dès 300 DH d'achats"}</span>
                    <span className="font-mono font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      -10% {lang === "ar" ? "تخفيض" : "OFF"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-amber-400/20">
                    <span className="text-neutral-300 font-semibold">{lang === "ar" ? "مجموع 500 د.م. فأكثر" : "Dès 500 DH d'achats"}</span>
                    <span className="font-mono font-black text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-400/30">
                      -15% {lang === "ar" ? "تخفيض" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>

              {/* بطاقات المزايا الثلاث الراقية بأيقونات فيكتور متناسقة */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 hover:bg-white/[0.07] transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">
                    {lang === "ar" ? "1. حرية الاختيار" : "1. Choix Libre"}
                  </h4>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    {lang === "ar" ? "أضف ما تحبه من عسل وأملو وزيوت بالأحجام التي تريد." : "Sélectionnez vos produits favoris."}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 hover:bg-white/[0.07] transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-amber-300">
                    {lang === "ar" ? "2. خصم فوري يرتفع" : "2. Remise Directe"}
                  </h4>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    {lang === "ar" ? "يطبق الخصم تلقائياً كلما أضفت منتجات أكثر للباقة." : "Calculée et appliquée instantanément."}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 hover:bg-white/[0.07] transition-colors">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <PackageCheck className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-emerald-300">
                    {lang === "ar" ? "3. تغليف هدايا راقٍ" : "3. Emballage Cadeau"}
                  </h4>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    {lang === "ar" ? "صندوق فاخر محكم الحماية وتوصيل آمن لباب البيت." : "Coffret élégant offert et sécurisé."}
                  </p>
                </div>
              </div>

              {/* زر التوجيه الأنيق لصفحة التشكيل */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/custom-bundle"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs sm:text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2 group"
                >
                  <span>{lang === "ar" ? "ابدأ تشكيل باقتك المخصصة الآن" : "Composer Mon Pack Maintenant"}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === "ar" ? "بدون شروط معقدة • خصم وتوصيل مجاني" : "Sans engagement • Livraison rapide"}</span>
                </div>
              </div>

            </div>

            {/* العمود الثاني: محاكي الصندوق الفاخر مع توضيح التوفير */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-[2.5rem] bg-gradient-to-b from-white/10 via-white/5 to-white/[0.02] backdrop-blur-xl border border-white/20 p-6 space-y-5 shadow-2xl overflow-hidden group">
                
                {/* شريط علوي في الكرت */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{lang === "ar" ? "صندوق BioZad الملكي" : "Coffret Royal BioZad"}</span>
                  </span>
                  <span className="bg-emerald-500/80 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full font-mono">
                    {lang === "ar" ? "توفير يصل لـ 15%" : "JUSQU'À -15%"}
                  </span>
                </div>

                {/* تشكيلة بصرية رمزية لمحتويات الصندوق المخصص */}
                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                    <img 
                      src="https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=200" 
                      alt="عسل" 
                      className="h-12 w-12 rounded-xl object-cover mx-auto" 
                    />
                    <p className="text-[10px] font-bold text-neutral-200 truncate">{lang === "ar" ? "عسل طبيعي" : "Miel"}</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                    <img 
                      src="https://images.unsplash.com/photo-1599305090598-fe179d501227?w=200" 
                      alt="أملو" 
                      className="h-12 w-12 rounded-xl object-cover mx-auto" 
                    />
                    <p className="text-[10px] font-bold text-neutral-200 truncate">{lang === "ar" ? "أملو بلدي" : "Amlou"}</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                    <img 
                      src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200" 
                      alt="أركان" 
                      className="h-12 w-12 rounded-xl object-cover mx-auto" 
                    />
                    <p className="text-[10px] font-bold text-neutral-200 truncate">{lang === "ar" ? "زيت أركان" : "Argan"}</p>
                  </div>
                </div>

                {/* بطاقة محاكاة التوفير الحيّة (Live Simulation Box) */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>{lang === "ar" ? "مثال: قيمة الباقة التي شكلتها:" : "Exemple de panier :"}</span>
                    <span className="font-mono text-neutral-300">500 د.م.</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>{lang === "ar" ? "خصم فوري مباشر (15%):" : "Remise immédiate (15%) :"}</span>
                    <span className="font-mono">-75 د.م.</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex items-center justify-between font-black text-sm text-white">
                    <span>{lang === "ar" ? "تدفع فقط:" : "Vous payez :"}</span>
                    <span className="text-amber-300 font-mono text-base">425 د.م.</span>
                  </div>
                </div>

                <Link
                  href="/custom-bundle"
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-amber-300" />
                  <span>{lang === "ar" ? "تجربة تشكيل الباقة الآن" : "Composer mon pack"}</span>
                </Link>

              </div>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}
