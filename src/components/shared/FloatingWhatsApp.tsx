"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);

  // إخفاء الزر العائم في لوحة التحكم، ونقاط البيع، وصفحات الهبوط
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/pos") ||
    pathname.startsWith("/lp")
  ) {
    return null;
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212602732533";

  // إظهار التلميح الترحيبي بعد 4 ثوانٍ من دخول الزائر
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const message = encodeURIComponent(
    "السلام عليكم متجر BioZad، أود الاستفسار عن منتجاتكم الطبيعية وتفاصيل التوصيل."
  );
  const waUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-end gap-3 select-none" dir="rtl">
      
      {/* بالون الرسالة الترحيبية التفاعلية */}
      {showTooltip && (
        <div className="relative hidden sm:flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-2xl shadow-premium-lg text-xs font-bold text-neutral-800 dark:text-neutral-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setShowTooltip(false)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-0.5"
            title="إغلاق التلميح"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <span>مرحباً بك! تواصل معنا مباشرة عبر الواتساب 💬</span>
        </div>
      )}

      {/* الزر الدائري العائم للواتساب */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل مع متجر BioZad عبر الواتساب"
        className="group relative flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl shadow-[#25D366]/40 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* حلقة النبض الضوئية */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10" />

        <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12" />
      </a>
    </div>
  );
}
