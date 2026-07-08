import { create } from "zustand";

interface UIStore {
  lang: "ar" | "fr";
  dir: "rtl" | "ltr";
  cartOpen: boolean;
  setLang: (lang: "ar" | "fr") => void;
  setCartOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  lang: "ar",
  dir: "rtl",
  cartOpen: false,
  setLang: (lang) => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    // تحديث اتجاه الصفحة في لغة الـ HTML مباشرة لتغيير تخطيط الموقع بالكامل تلقائياً
    if (typeof document !== "undefined") {
      document.documentElement.dir = dir;
      document.documentElement.lang = lang;
    }
    set({ lang, dir });
  },
  setCartOpen: (open) => set({ cartOpen: open }),
}));