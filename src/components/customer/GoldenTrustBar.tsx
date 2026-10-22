"use client";

import React from "react";
import { Eye, ShieldCheck, Truck, RotateCcw, Award, Sparkles } from "lucide-react";

interface GoldenTrustBarProps {
  className?: string;
  variant?: "compact" | "full";
}

export function GoldenTrustBar({ className = "", variant = "full" }: GoldenTrustBarProps) {
  const guarantees = [
    {
      icon: Eye,
      title: "المعاينة قبل الدفع",
      desc: "افتح طردك وعاين المنتج براحتك قبل أداء أي درهم للموزع",
      badge: "أمان 100%",
    },
    {
      icon: Award,
      title: "طبيعي وأصيل 100%",
      desc: "جودة مغربية أصيلة بدون سكريات مضافة أو مواد حافظة",
      badge: "جودة معتمدة",
    },
    {
      icon: Truck,
      title: "توصيل سريع لباب دارك",
      desc: "شحن مضمون في 24 إلى 48 ساعة لجميع مدن ومناطق المغرب",
      badge: "دفع عند الاستلام",
    },
    {
      icon: RotateCcw,
      title: "ضمان الاستبدال والاسترجاع",
      desc: "إذا لم تكن راضياً بنسبة 100%، نستبدل المنتج أو نرجع أموالك",
      badge: "راحة بال تامة",
    },
  ];

  if (variant === "compact") {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-emerald-50/50 to-amber-50/70 dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 border border-amber-400/30 dark:border-amber-600/20 shadow-sm ${className}`}>
        <div className="flex items-center justify-between gap-2 border-b border-amber-200/50 dark:border-neutral-800 pb-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-400">
            <Sparkles className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: "8s" }} />
            <span>ضمانات المتجر الرسمية لزبنائنا الكرام</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
            شراء آمن بدون مخاطرة
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {guarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-2 text-right">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5 line-clamp-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/60 dark:from-neutral-900 dark:via-neutral-900 dark:to-emerald-950/20 border-2 border-amber-300/40 dark:border-amber-600/30 shadow-premium-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-4 mb-4 border-b border-amber-200/50 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-right">
          <div className="h-8 w-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>شريط الضمانات الذهبي لعلامة BioZad</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              تسوق بكل ثقة وراحة بال، نحن نضع رضاك وأصالة المنتج فوق كل اعتبار.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-300/40">
          ✓ ثقة أكثر من 5,000 زبون مغربي
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guarantees.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/80 dark:bg-neutral-850 border border-amber-200/40 dark:border-neutral-800 space-y-2 text-right hover:border-amber-400/60 transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-black text-amber-800 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                  {item.badge}
                </span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
