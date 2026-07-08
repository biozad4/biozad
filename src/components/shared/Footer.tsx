"use client";

import React from "react";
import { useUIStore } from "@/store/useUIStore";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const TRANSLATIONS = {
  ar: {
    brand: "BioZad",
    tagline: "الثمن ينقص والجودة تزداد",
    copyright: "جميع الحقوق محفوظة © 2026 BioZad. تم التطوير بكل شغف.",
    about: "عن العلامة",
    aboutText: "علامة تجارية مغربية فاخرة ملتزمة بتقديم أجود أنواع العسل الطبيعي، أملو الأصيل، والزيوت الطبيعية المعصورة بنقاء 100% من قلب الطبيعة المغربية مباشرة إليكم.",
    quickLinks: "روابط سريعة",
    contactUs: "تواصل معنا",
    allProducts: "كامل التشكيلة",
    honey: "عسل ومشتقاته",
    amlou: "أملو الفاخر",
    oils: "زيوت طبيعية",
    perfumes: "عطور وبخور",
    tea: "الشاي المغربي",
    remedies: "خلطات ووصفات علاجية",
    offers: "العروض الخاصة"
  },
  fr: {
    brand: "BioZad",
    tagline: "Le prix baisse, la qualité augmente",
    copyright: "Tous droits réservés © 2026 BioZad. Conçu avec passion.",
    about: "À Propos",
    aboutText: "Une marque marocaine premium dédiée à vous offrir le meilleur du terroir : miel pur, amlou traditionnel et huiles pressées à froid, 100% naturels et authentiques.",
    quickLinks: "Liens Rapides",
    contactUs: "Contactez-nous",
    allProducts: "Toute la Collection",
    honey: "Miel & Dérivés",
    amlou: "Amlou d'Exception",
    oils: "Huiles Naturelles",
    perfumes: "Parfums & Encens",
    tea: "Thé Marocain",
    remedies: "Remèdes & Recettes",
    offers: "Offres Spéciales"
  }
};

export function Footer() {
  const { lang } = useUIStore();
  const t = TRANSLATIONS[lang];

  return (
    <footer className="w-full border-t border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* العمود الأول: عن العلامة */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="BioZad Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="font-serif text-lg font-black tracking-tight text-primary dark:text-white -mb-0.5">
                  {t.brand}
                </span>
                <span className="text-[7.5px] text-accent font-bold uppercase tracking-wider leading-none">
                  {t.tagline}
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed max-w-sm text-neutral-500">
              {t.aboutText}
            </p>
            <div className="pt-2">
              <a 
                href="/about" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-accent hover:underline"
              >
                <span>{t.about}</span>
                <ArrowRight className="h-3.5 w-3.5 rotate-180 rtl:rotate-0" />
              </a>
            </div>
          </div>

          {/* العمود الثاني: روابط سريعة */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              {t.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/shop#products" className="hover:text-primary transition-colors">{t.allProducts}</a>
              </li>
              <li>
                <a href="/honey#products" className="hover:text-primary transition-colors">{t.honey}</a>
              </li>
              <li>
                <a href="/amlou#products" className="hover:text-primary transition-colors">{t.amlou}</a>
              </li>
              <li>
                <a href="/oils#products" className="hover:text-primary transition-colors">{t.oils}</a>
              </li>
              <li>
                <a href="/perfumes#products" className="hover:text-primary transition-colors">{t.perfumes}</a>
              </li>
              <li>
                <a href="/tea#products" className="hover:text-primary transition-colors">{t.tea}</a>
              </li>
              <li>
                <a href="/remedies#products" className="hover:text-primary transition-colors">{t.remedies}</a>
              </li>
              <li>
                <a href="/offers#products" className="hover:text-primary transition-colors">{t.offers}</a>
              </li>
            </ul>
          </div>

          {/* العمود الثالث: معلومات الاتصال */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              {t.contactUs}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <span className="font-mono text-neutral-500">+212 600 000 000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <span className="font-mono text-neutral-500">contact@biozad.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                <span className="text-neutral-500">{lang === "ar" ? "سلا المغرب" : "salé, Maroc"}</span>
              </li>
            </ul>

            {/* شبكات التواصل الاجتماعي */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="rounded-full p-2 border border-neutral-100 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900 transition-all text-neutral-400 hover:text-primary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="rounded-full p-2 border border-neutral-100 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900 transition-all text-neutral-400 hover:text-primary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0 -5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* سطر حقوق النشر */}
        <div className="border-t border-neutral-100 dark:border-neutral-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-neutral-400">
          <span>{t.copyright}</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">{lang === "ar" ? "سياسة الخصوصية" : "Politique de confidentialité"}</a>
            <a href="#" className="hover:underline">{lang === "ar" ? "شروط الاستخدام" : "Conditions d'utilisation"}</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
