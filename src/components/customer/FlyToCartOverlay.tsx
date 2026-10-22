"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCart, FlyingItem } from "@/store/useFlyToCart";
import { Sparkles, ShoppingBag } from "lucide-react";

function FlyingProductThumbnail({ item }: { item: FlyingItem }) {
  const removeFlyingItem = useFlyToCart((state) => state.removeFlyingItem);
  const setCartBouncing = useFlyToCart((state) => state.setCartBouncing);

  const deltaX = item.endX - item.startX;
  const deltaY = item.endY - item.startY;

  return (
    <motion.div
      key={item.id}
      initial={{
        position: "fixed",
        left: item.startX,
        top: item.startY,
        x: "-50%",
        y: "-50%",
        scale: 0.3,
        opacity: 0,
        rotate: 0,
      }}
      animate={{
        // حركة أفقية بانحناء سلس نحو السلة
        x: [
          "-50%",
          `calc(-50% + ${deltaX * 0.35}px)`,
          `calc(-50% + ${deltaX * 0.75}px)`,
          `calc(-50% + ${deltaX}px)`,
        ],
        // حركة رأسية تقوسية (Arc) تقفز للأعلى قليلاً ثم تتجه مباشرة نحو السلة بالهيدر
        y: [
          "-50%",
          `calc(-50% - 45px)`,
          `calc(-50% + ${deltaY * 0.6}px)`,
          `calc(-50% + ${deltaY}px)`,
        ],
        // تصغير الحجم تدريجياً لتبدو كأنها تدخل داخل حقيبة السلة
        scale: [0.3, 1.15, 0.9, 0.18],
        opacity: [0, 1, 1, 0.85, 0],
        rotate: [0, -15, 12, -6, 0],
      }}
      transition={{
        duration: 0.72,
        ease: [0.22, 1, 0.36, 1], // حركة انسيابية ذكية وشديدة النعومة
        times: [0, 0.25, 0.7, 1],
      }}
      onAnimationComplete={() => {
        // تفاعل ارتدادي ذكي لأيقونة السلة عند وصول المنتج إليها
        setCartBouncing(true);
        setTimeout(() => {
          setCartBouncing(false);
        }, 500);
        removeFlyingItem(item.id);
      }}
      className="pointer-events-none z-[99999] select-none"
    >
      <div className="relative h-12 w-12 sm:h-13 sm:w-13 rounded-full p-0.5 bg-gradient-to-tr from-emerald-600 via-amber-400 to-emerald-500 shadow-[0_8px_20px_-3px_rgba(16,185,129,0.5),0_0_15px_rgba(245,158,11,0.4)] ring-2 ring-white/90 dark:ring-neutral-900">
        <div className="h-full w-full rounded-full overflow-hidden bg-white dark:bg-neutral-900 flex items-center justify-center">
          {item.image ? (
            <img
              src={item.image}
              alt="Flying Product"
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            <div className="h-full w-full bg-emerald-700 flex items-center justify-center text-white">
              <ShoppingBag className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* وميض بريق ذهبي ناعم في زاوية المنتج الطائر */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-neutral-950 shadow-xs">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
      </div>
    </motion.div>
  );
}

export function FlyToCartOverlay() {
  const flyingItems = useFlyToCart((state) => state.flyingItems);

  if (flyingItems.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      <AnimatePresence>
        {flyingItems.map((item) => (
          <FlyingProductThumbnail key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}
