"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InstantCODForm, SelectedOffer } from "./InstantCODForm";
import { GoldenTrustBar } from "./GoldenTrustBar";
import { FacebookPixel } from "../shared/FacebookPixel";
import * as pixel from "@/lib/pixel";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Star,
  Sparkles,
  PhoneCall,
  Clock,
  ChevronDown,
  Gift,
  Award,
  Check,
  ArrowDown,
  MessageCircle,
} from "lucide-react";

interface LandingPageViewProps {
  page: any;
  whatsappNumber?: string;
}

export function LandingPageView({ page, whatsappNumber }: LandingPageViewProps) {
  const hero = page.hero || {};
  const offersList = Array.isArray(hero.offers) && hero.offers.length > 0
    ? hero.offers
    : [
        {
          id: "offer-1",
          title: "عبوة واحدة (تجربة)",
          quantity: 1,
          price: hero.price || 180,
          compareAtPrice: (hero.price || 180) + 70,
          freeShipping: false,
          badge: "سعر عادي",
          isPopular: false,
        },
        {
          id: "offer-2",
          title: "عبوتان (الأكثر طلباً ⭐)",
          quantity: 2,
          price: Math.round((hero.price || 180) * 1.7),
          compareAtPrice: ((hero.price || 180) + 70) * 2,
          freeShipping: true,
          badge: "وفر 90 د.م + توصيل مجاني",
          isPopular: true,
        },
        {
          id: "offer-3",
          title: "3 عبوات (باقة العائلة التوفيرية)",
          quantity: 3,
          price: Math.round((hero.price || 180) * 2.3),
          compareAtPrice: ((hero.price || 180) + 70) * 3,
          freeShipping: true,
          badge: "توصيل مجاني + هدية خاصة",
          isPopular: false,
        },
      ];

  const defaultOffer = offersList.find((o: any) => o.isPopular) || offersList[0];
  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer>(defaultOffer);

  const images: string[] = Array.isArray(hero.images) && hero.images.length > 0
    ? hero.images
    : ["https://images.unsplash.com/photo-1608248597359-bb5c68f2f254?auto=format&fit=crop&q=80&w=800"];
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // إعداد عداد التنازلي التفاعلي
  const [timeLeft, setTimeLeft] = useState({ minutes: 34, seconds: 50 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // تتبع حدث ViewContent عند دخول الصفحة
  useEffect(() => {
    pixel.trackViewContent(page.title, selectedOffer.price, "MAD", {
      content_id: hero.productId,
      slug: page.slug,
    });
  }, [page.title, selectedOffer.price, hero.productId, page.slug]);

  // التمرير السلس إلى استمارة الطلب
  const scrollToForm = () => {
    const el = document.getElementById("cod-order-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const reviews = Array.isArray(hero.reviews) && hero.reviews.length > 0 ? hero.reviews : [];
  const features = Array.isArray(hero.features) && hero.features.length > 0 ? hero.features : [];
  const faq = Array.isArray(hero.faq) && hero.faq.length > 0 ? hero.faq : [];

  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <div className="bg-[#FAF9F6] dark:bg-neutral-950 min-h-screen text-neutral-900 dark:text-neutral-100 font-sans selection:bg-primary selection:text-white pb-24">
      
      {/* بيكسل مخصص للصفحة إن وجد */}
      {hero.facebookPixelId && <FacebookPixel pixelId={hero.facebookPixelId} />}

      {/* 1. شريط الإعلان العلوي المثير للاهتمام (Urgency Bar) */}
      <div className="bg-primary text-white py-2.5 px-4 text-center text-xs sm:text-sm font-black flex items-center justify-center gap-2 tracking-wide sticky top-0 z-40 shadow-sm">
        <Truck className="h-4 w-4 animate-bounce" />
        <span>توصيل مجاني وسريع لجميع مدن المغرب • الدفع عند الاستلام بعد المعاينة</span>
      </div>

      {/* 2. هيدر صفحة الهبوط المصغر والموثوق */}
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 py-3 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BioZad" className="h-9 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-serif text-lg font-black text-primary dark:text-white leading-none">BioZad</span>
              <span className="text-[8px] text-accent font-bold uppercase tracking-widest">منتجات طبيعية فاخرة</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>جودة أصلية مضمونة 100%</span>
            </span>
            <button
              onClick={scrollToForm}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>اطلب الآن</span>
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. شريط العداد التنازلي الترويجي (Urgency Timer) */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black">
            <Clock className="h-4 w-4 animate-spin text-amber-600" />
            <span>عرض ترويجي محدود: ينتهي الخصم خلال:</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-black text-amber-800 dark:text-amber-300">
            <span className="bg-amber-200/80 dark:bg-amber-900 px-2 py-1 rounded-lg">
              {String(timeLeft.minutes).padStart(2, "0")} دقيقة
            </span>
            <span>:</span>
            <span className="bg-amber-200/80 dark:bg-amber-900 px-2 py-1 rounded-lg">
              {String(timeLeft.seconds).padStart(2, "0")} ثانية
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 mr-2 font-sans">
              (باقي <strong>{hero.stockLeft || 7} قطع فقط</strong> بهذا السعر)
            </span>
          </div>
        </div>
      </div>

      {/* 4. القسم الرئيسي: صور المنتج + العروض + الاستمارة المباشرة */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-10 sm:space-y-16">
        
        {/* شارة العرض الرئيسي والعنوان */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          {hero.badge && (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-black text-xs uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{hero.badge}</span>
            </span>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white leading-tight">
            {hero.title?.ar || page.title}
          </h1>
          {hero.subtitle?.ar && (
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              {hero.subtitle.ar}
            </p>
          )}
        </div>

        {/* شبكة الوسائط والعروض واستمارة الدفع عند الاستلام */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* العمود الأول: معرض الصور والضمانات (5 أعمدة) */}
          <div className="lg:col-span-5 space-y-4">
            {/* الصورة الرئيسية الكبيرة */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-premium-md">
              <motion.img
                key={selectedImageIdx}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={images[selectedImageIdx]}
                alt={page.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">
                منتج مغربي أصلي 100%
              </span>
            </div>

            {/* صور مصغرة إن وجدت */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white dark:bg-neutral-900 ${
                      selectedImageIdx === idx
                        ? "border-primary ring-2 ring-primary/20 scale-105"
                        : "border-neutral-200 dark:border-neutral-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {/* شارات الضمان والاطمئنان تحت الصور */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center gap-2.5 shadow-sm">
                <Truck className="h-5 w-5 text-emerald-600 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <strong className="block font-black text-neutral-900 dark:text-white">شحن فوري</strong>
                  <span className="text-neutral-500 text-[10px]">خلال 24-48 ساعة</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center gap-2.5 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <div className="text-[11px] leading-tight">
                  <strong className="block font-black text-neutral-900 dark:text-white">معاينة قبل الدفع</strong>
                  <span className="text-neutral-500 text-[10px]">تأكد من طردك بنفسك</span>
                </div>
              </div>
            </div>

            {/* فيديو توضيحي إن وجد */}
            {hero.videoUrl && (
              <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 aspect-video bg-neutral-900">
                <iframe
                  src={hero.videoUrl}
                  title="فيديو توضيحي"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

          </div>

          {/* العمود الثاني: اختيار العرض + استمارة COD الفورية (7 أعمدة) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* اختيار باقة الشراء (Quantity Offers Selector) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-accent" />
                  <span>الخطوة 1: اختر العرض المناسب لك:</span>
                </label>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  تخفيض تلقائي
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {offersList.map((offer: SelectedOffer & { isPopular?: boolean }) => {
                  const isSelected = selectedOffer.id === offer.id;
                  return (
                    <div
                      key={offer.id}
                      onClick={() => {
                        setSelectedOffer(offer);
                        pixel.trackInitiateCheckout(offer.title, offer.price, "MAD");
                      }}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-600/10"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      {offer.isPopular && (
                        <span className="absolute -top-3 left-4 bg-accent text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-sm">
                          ⭐ الأكثر مبيعاً
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Radio Check Circle */}
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-neutral-300 dark:border-neutral-700 bg-transparent"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
                              {offer.title}
                            </h4>
                            {offer.badge && (
                              <span className="inline-block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                                {offer.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-left">
                          <div className="text-lg sm:text-xl font-serif font-black text-primary dark:text-accent font-mono">
                            {offer.price} <span className="text-xs font-sans">د.م.</span>
                          </div>
                          {offer.compareAtPrice && offer.compareAtPrice > offer.price && (
                            <span className="text-[11px] text-neutral-400 line-through font-mono block">
                              {offer.compareAtPrice} د.م.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* شريط الضمانات المغربي الذهبي لتعزيز الثقة قبل إدخال البيانات */}
            <GoldenTrustBar variant="compact" />

            {/* الخطوة 2: استمارة COD الفورية */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>الخطوة 2: أدخل معلومات الاستلام:</span>
              </label>

              <InstantCODForm
                productId={hero.productId || "biozad-lp-item"}
                productTitle={hero.productTitle || page.title}
                selectedOffer={selectedOffer}
                landingPageTitle={page.title}
                pixelId={hero.facebookPixelId}
                whatsappNumber={whatsappNumber}
              />
            </div>

          </div>

        </div>

        {/* 5. مميزات المنتج وخصائصه التنافسية */}
        {features.length > 0 && (
          <section className="space-y-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-accent uppercase tracking-wider">لماذا منتجاتنا هي الأفضل؟</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                الجودة المغربية الخالصة بدون مساومات
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feat: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-2 shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary dark:text-accent flex items-center justify-center font-bold">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">{feat.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{feat.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. شهادات وآراء الزبائن الحقيقيين بالمغرب (Social Proof) */}
        {reviews.length > 0 && (
          <section className="space-y-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                تجارب زبنائنا الكرام بعد الاستعمال
              </h2>
              <p className="text-xs text-neutral-500">تقييم 4.9 من أصل 5 بناءً على مئات الطلبات المسلمة بنجاح.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((rev: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-3 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">{rev.name}</h4>
                      <span className="text-[10px] text-neutral-400">{rev.city} • {rev.date}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>زبون موثق اشترى المنتج</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. الأسئلة الشائعة (FAQ) */}
        {faq.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-neutral-200 dark:border-neutral-800 max-w-3xl mx-auto">
            <div className="text-center space-y-1">
              <span className="text-xs font-black text-accent uppercase tracking-wider">لديك أي استفسار؟</span>
              <h2 className="font-serif text-2xl font-black text-neutral-900 dark:text-white">الأسئلة الأكثر تكراراً</h2>
            </div>

            <div className="space-y-2.5">
              {faq.map((item: any, idx: number) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full p-4 text-right flex justify-between items-center gap-3 font-bold text-xs sm:text-sm text-neutral-900 dark:text-white"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180 text-primary" : "text-neutral-400"}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-neutral-500 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-2.5">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* زر سفلي للتذكير بالطلب */}
        <div className="text-center pt-4">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>اطلب الآن واستفد من التوصيل المجاني</span>
          </button>
        </div>

      </main>

      {/* 8. زر الهاتف العائم في الأسفل (Mobile Sticky CTA) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="space-y-0.5">
            <span className="text-[10px] text-neutral-400 font-bold block">السعر المخفض:</span>
            <div className="text-base font-serif font-black text-primary dark:text-accent font-mono">
              {selectedOffer.price} <span className="text-[10px] font-sans">د.م.</span>
            </div>
          </div>
          <button
            onClick={scrollToForm}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>اطلب الآن • الدفع عند الاستلام</span>
          </button>
        </div>
      </div>

    </div>
  );
}
