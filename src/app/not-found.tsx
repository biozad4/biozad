"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Home, ShoppingBag, MessageCircle, ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212602732533";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FAF9F6] dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* شارة توضيحية */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/40 text-emerald-800 dark:text-emerald-300 text-xs font-black">
          <Compass className="h-4 w-4 animate-spin text-accent" style={{ animationDuration: "12s" }} />
          <span>خطأ 404 • الصفحة غير متوفرة</span>
        </div>

        {/* الرقم والرمز البصري الفاخر */}
        <div className="relative">
          <div className="text-8xl sm:text-9xl font-serif font-black tracking-tight text-primary/15 dark:text-white/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-3xl sm:text-4xl font-black text-primary dark:text-accent drop-shadow-sm">
              ضللت الطريق؟
            </span>
          </div>
        </div>

        {/* الوصف والإرشاد */}
        <div className="space-y-3 max-w-md mx-auto">
          <h2 className="font-serif text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
            الصفحة التي طلبتها غير موجودة
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            ربما تم تعديل الرابط أو حذفه، لكن خيرات الطبيعة المغربية في BioZad ما زالت في انتظارك! اختر وجهتك التالية:
          </p>
        </div>

        {/* أزرار التوجيه السريعة */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Home className="h-4 w-4" />
            <span>العودة للرئيسية</span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 text-neutral-800 dark:text-neutral-200 font-bold text-xs shadow-sm transition-all"
          >
            <ShoppingBag className="h-4 w-4 text-accent" />
            <span>تصفح كامل المنتجات</span>
          </Link>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("السلام عليكم متجر BioZad، دخلت لرابط غير متاح وأود الاستفسار عن منتجاتكم.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span>مساعدة عبر واتساب</span>
          </a>
        </div>

        {/* روابط سريعة للأقسام المشهورة */}
        <div className="border-t border-neutral-200/60 dark:border-neutral-800 pt-6">
          <span className="text-[11px] font-bold text-neutral-400 block mb-3 uppercase tracking-wider">
            أو تصفح الأقسام الأكثر طلباً:
          </span>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold">
            <Link href="/honey" className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-primary/10 hover:text-primary transition-colors">
              🍯 عسل طبيعي
            </Link>
            <Link href="/amlou" className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-primary/10 hover:text-primary transition-colors">
              🌰 أملو باللوز
            </Link>
            <Link href="/oils" className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-primary/10 hover:text-primary transition-colors">
              🌿 زيوت طبيعية
            </Link>
            <Link href="/offers" className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300/40 hover:bg-amber-100 transition-colors">
              ⭐ العروض الخاصة
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
