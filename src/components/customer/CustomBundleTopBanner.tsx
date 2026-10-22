"use client";

import React from "react";
import { useUIStore } from "@/store/useUIStore";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import Link from "next/link";

interface CustomBundleTopBannerProps {
  isActive?: boolean;
}

export function CustomBundleTopBanner({ isActive = true }: CustomBundleTopBannerProps) {
  const { lang } = useUIStore();

  if (!isActive) return null;

  return (
    <div className="relative z-40 bg-gradient-to-r from-emerald-950 via-primary to-amber-950 text-white border-b border-emerald-800/40 shadow-sm py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
        
        {/* النصوص والأيقونة */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-7 w-7 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-sm shrink-0">
            🎁
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-white">
              {lang === "ar" ? "أتريد اختيار مكونات باقتك بنفسك؟" : "Envie de composer votre pack sur-mesure ?"}
            </span>

            <span className="bg-amber-400 text-neutral-950 font-black px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase">
              {lang === "ar" ? "خصم يصل إلى 15%" : "Jusqu'à 15% OFF"}
            </span>

            <span className="hidden md:inline-block text-neutral-200 text-[11px] truncate">
              {lang === "ar" 
                ? "شكّل باقتك الفاخرة بالمنتجات والأوزان التي تختارها مع تخفيض فوري متصاعد!" 
                : "Composez votre sélection avec remise progressive immédiate !"}
            </span>
          </div>
        </div>

        {/* زر التوجيه */}
        <Link
          href="/custom-bundle"
          className="px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black shrink-0 transition-transform hover:scale-105 shadow-xs flex items-center gap-1.5"
        >
          <span>{lang === "ar" ? "شكّل باقتك الآن" : "Composer mon pack"}</span>
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>

      </div>
    </div>
  );
}
