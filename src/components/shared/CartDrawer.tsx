"use client";

import React from "react";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { PremiumButton } from "../ui/premium-button";
import { usePathname } from "next/navigation";

export function CartDrawer() {
  const { lang, dir, cartOpen, setCartOpen } = useUIStore();
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();

  const isRtl = dir === "rtl";
    const pathname = usePathname();
if (pathname.startsWith("/admin") || pathname.startsWith("/pos")) {
  return null; // تختفي السلة تماماً في صفحات الإدارة والـ POS
}
  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* الخلفية المظلمة الشفافة (Overlay) عند فتح السلة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* لوحة السلة المنزلقة (Drawer Panel) */}
          <motion.div
            initial={{ x: isRtl ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-neutral-950 p-6 shadow-premium-lg flex flex-col justify-between ${
              isRtl ? "left-0" : "right-0"
            }`}
          >
            {/* رأس السلة */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-lg font-bold">
                  {lang === "ar" ? "سلة التسوق" : "Votre Panier"}
                </h3>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="rounded-full p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* محتويات السلة والمنتجات المضافة */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 divide-y divide-neutral-100 dark:divide-neutral-900">
              {items.map((item) => (
                <div key={item.id + (item.variantSku || "")} className="flex gap-4 pt-4 first:pt-0">
                  <img
                    src={item.image}
                    alt={item.title[lang]}
                    className="h-16 w-16 rounded-xl object-cover bg-neutral-50"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
                      {item.title[lang]}
                    </h4>
                    <p className="text-xs font-bold text-primary font-mono">
                      {item.price} {lang === "ar" ? "د.م." : "DH"}
                    </p>
                    
                    {/* تحكم الكاشير/العميل السريع بالكميات داخل السلة */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantSku)}
                        className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantSku)}
                        className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id, item.variantSku)}
                    className="text-neutral-300 hover:text-rose-600 self-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-24 text-neutral-400 space-y-3">
                  <ShoppingBag className="h-10 w-10 mx-auto text-neutral-300" />
                  <p className="text-xs">
                    {lang === "ar" ? "لم تقم بإضافة أي منتجات بعد." : "Votre panier est vide."}
                  </p>
                </div>
              )}
            </div>

            {/* الحساب النهائي والمجموع الكلي وزر الدفع */}
            {items.length > 0 && (
              <div className="border-t border-neutral-100 dark:border-neutral-900 pt-4 space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>{lang === "ar" ? "المجموع الكلي:" : "Total :"}</span>
                  <span className="text-lg font-bold text-primary dark:text-accent font-mono">
                    {getCartTotal()} {lang === "ar" ? "د.م." : "DH"}
                  </span>
                </div>
                
                <a href="/checkout" className="block w-full" onClick={() => setCartOpen(false)}>
                  <PremiumButton variant="primary" className="w-full py-4 text-sm font-bold">
                    {lang === "ar" ? "الانتقال لصفحة إتمام الطلب" : "Commander maintenant"}
                  </PremiumButton>
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}