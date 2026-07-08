"use client";

import React from "react";
import { useUIStore } from "@/store/useUIStore";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const CATEGORIES_DATA = {
  ar: [
    {
      title: "العسل الطبيعي الحر",
      desc: "نقاء وجودة مضمونة من مناحلنا الجبلية",
      image: "./img/asal.jpeg",
      link: "/honey#products"
    },
    {
      title: "أملو الفاخر الأصيل",
      desc: "باللوز البلدي المحمص وزيت الأركان البكر",
      image: "./img/amlou.jpeg",
      link: "/amlou#products"
    },
    {
      title: "الزيوت الطبيعية المعصورة",
      desc: "زيوت أركان نقية وتجميلية معصورة على البارد",
      image: "./img/zit.jpeg",
      link: "/oils#products"
    },
    {
      title: "العطور الفاخرة والبخور",
      desc: "روائح مغربية ونفحات بخور فواحة ودافئة",
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
      link: "/perfumes#products"
    },
    {
      title: "خلطات ووصفات علاجية",
      desc: "وصفات وتركيبات عشبية مغذية وصحية",
      image: "./img/khalta.jpeg",
      link: "/remedies#products"
    },
    {
      title: "الشاي المغربي الأصيل",
      desc: "شاي مغربي منتقى بعناية مع خلطات الأعشاب",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800",
      link: "/tea#products"
    }
  ],
  fr: [
    {
      title: "Miel Pur & Naturel",
      desc: "Pureté garantie extraite de nos ruches de montagne",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
      link: "/honey#products"
    },
    {
      title: "Amlou d'Exception",
      desc: "Aux amandes torréfiées et à l'huile d'argan pure",
      image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800",
      link: "/amlou#products"
    },
    {
      title: "Huiles Naturelles",
      desc: "Huiles d'argan alimentaires et cosmétiques bio",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800",
      link: "/oils#products"
    },
    {
      title: "Parfums & Encens",
      desc: "Fragrances marocaines raffinées et encens traditionnels",
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
      link: "/perfumes#products"
    },
    {
      title: "Remèdes & Recettes",
      desc: "Mélanges thérapeutiques et herbes bienfaisantes",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
      link: "/remedies#products"
    },
    {
      title: "Thé Marocain Traditionnel",
      desc: "Thés verts sélectionnés infusés aux plantes naturelles",
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800",
      link: "/tea#products"
    }
  ]
};

export function FeaturedCategories() {
  const { lang } = useUIStore();
  const cats = CATEGORIES_DATA[lang];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      
      {/* رأس القسم */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3.5 py-1 text-[10px] font-bold text-primary dark:text-accent uppercase tracking-wider">
          {lang === "ar" ? "تصفح حسب اختيارك" : "CATÉGORIES D'EXCEPTION"}
        </span>
        <h2 className="font-serif text-3xl font-black text-neutral-900 dark:text-white">
          {lang === "ar" ? "اكتشف فئاتنا الطبيعية" : "Nos Catégories Terroir"}
        </h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          {lang === "ar" ? "نقدم لك أفضل خيرات الطبيعة المغربية البكر بنقاء تام وضمان حقيقي للجودة." : "Découvrez le meilleur du terroir marocain extrait selon des normes traditionnelles strictes."}
        </p>
      </div>

      {/* شبكة عرض الفئات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map((cat, idx) => (
          <motion.a
            key={idx}
            href={cat.link}
            whileHover={{ y: -6 }}
            className="group relative h-72 rounded-3xl overflow-hidden shadow-premium-sm border border-neutral-100 dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-900 cursor-pointer block"
          >
            {/* الخلفية الصورية */}
            <img 
              src={cat.image} 
              alt={cat.title} 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* تظليل متدرج وناعم */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition-all duration-300 group-hover:via-black/45" />

            {/* نصوص الفئة والـ Call to Action */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white space-y-2">
              <h3 className="font-serif text-xl font-bold tracking-wide">
                {cat.title}
              </h3>
              <p className="text-[10px] text-neutral-300 line-clamp-2 leading-relaxed">
                {cat.desc}
              </p>
              
              <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-accent group-hover:text-white transition-colors">
                <span>{lang === "ar" ? "تصفح المنتجات" : "Découvrir"}</span>
                <ChevronRight className="h-4 w-4 rotate-0 rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>

    </section>
  );
}
