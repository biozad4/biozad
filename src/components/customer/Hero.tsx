"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { PremiumButton } from "../ui/premium-button";

const HERO_IMAGES = [
  "/img/hero1.jpg",
  "/img/hero2.jpg",
  "/img/hero3.jpg",
  "/img/hero4.jpg",
  "/img/hero5.jpg"
];

const CONTENT = {
  ar: {
    badge: "✨ BioZad — الثمن ينقص والجودة تزداد ✨",
    title: "على طريق السعادة، تجدنا في انتظارك...",
    desc: "تستنشق من عبير منتوجاتنا المغربية الطبيعية البكر الحياة... الأصالة، العراقة، والنقاء المستخلص بعناية فائقة 100% من أرضنا مباشرة لقلوبكم.",
    cta: "تسوق المعرض الفاخر الآن",
    secondaryCta: "عروضنا الحصرية",
  },
  fr: {
    badge: "✨ BioZad — Le prix baisse, la qualité augmente ✨",
    title: "Sur le chemin du bien-être, nous vous attendons...",
    desc: "Respirez la vitalité à travers nos produits naturels d'exception... L'authenticité, la tradition et la pureté marocaine dans chaque goutte.",
    cta: "Découvrir la Collection",
    secondaryCta: "Nos Offres Exclusives",
  },
};

interface HeroProps {
  bundle?: any;
}

export function Hero({ bundle }: HeroProps) {
  const { lang } = useUIStore();
  const c = CONTENT[lang];
  const [currentIdx, setCurrentIdx] = useState(0);

  const hasHotPromo = !!(bundle && bundle.hotProductTitle?.[lang]);
  const hotTitle = hasHotPromo 
    ? bundle.hotProductTitle[lang] 
    : (lang === "ar" ? "زيت التين الشوكي" : "Huile de Figue de Barbarie");
  const hotSub = hasHotPromo
    ? bundle.hotProductSub[lang]
    : (lang === "ar" ? "🔥 الأكثر طلباً هذا الأسبوع" : "🔥 Le plus demandé");
  const hotImage = (bundle && bundle.hotProductImage) || "";
  const hotLink = (bundle && bundle.hotProductLink) || "/shop#products";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FAF9F6] dark:bg-neutral-950 py-20 lg:py-32">
      {/* خلفية جمالية مدمجة بألوان هادئة ونقوش خافتة */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-accent/10 to-primary/5 blur-3xl opacity-70" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* النصوص التفاعلية */}
          <div className="space-y-8 text-center lg:text-start">
            
            {/* الشارة العلوية (Badge) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-xs font-semibold text-primary dark:text-accent"
            >
              {c.badge}
            </motion.div>

            {/* العنوان الرئيسي (Serif Title) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-neutral-900 dark:text-white"
            >
              {c.title}
            </motion.h1>

            {/* الوصف (Subtext) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              {c.desc}
            </motion.p>

            {/* أزرار اتخاذ القرار (CTAs) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <PremiumButton 
                variant="primary" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => window.location.href = '/shop#products'}
              >
                {c.cta}
              </PremiumButton>
              <PremiumButton 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => window.location.href = '/offers#products'}
              >
                {c.secondaryCta}
              </PremiumButton>
            </motion.div>
          </div>

          {/* الصورة الجمالية للمنتجات (Product Image Canvas - dynamic carousel sliding) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-md lg:max-w-none flex justify-center items-center"
          >
            {/* إطار فاخر ذو حواف دائرية عريضة مع سلايدر تلقائي للمنتجات الحقيقية */}
            <div className="relative aspect-[4/5] w-[85%] rounded-[2rem] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-900 shadow-premium-lg">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIdx}
                  src={HERO_IMAGES[currentIdx]}
                  alt="منتجات BioZad الفاخرة"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>

              {/* نقاط التنقل السفلية الدقيقة */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full">
                {HERO_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIdx ? "bg-accent w-3" : "bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* عنصر عائم عاكس للمنتج الصغير (Glassmorphism card float - dynamic) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute bottom-10 -right-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-4 rounded-2xl shadow-premium-md border border-white/20 hidden sm:block cursor-pointer hover:scale-105 active:scale-95 transition-all z-10"
              onClick={() => window.location.href = hotLink}
            >
              <div className="flex items-center gap-3">
                {hotImage ? (
                  <img src={hotImage} alt={hotTitle} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-sm">🌵</div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{hotTitle}</span>
                  <span className="text-[10px] text-neutral-400">{hotSub}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}