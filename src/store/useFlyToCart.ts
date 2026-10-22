"use client";

import { create } from "zustand";

export interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TriggerFlyOptions {
  image: string;
  event?: React.MouseEvent | MouseEvent;
  startElement?: HTMLElement | null;
  startX?: number;
  startY?: number;
}

interface FlyToCartState {
  flyingItems: FlyingItem[];
  cartBouncing: boolean;
  triggerFly: (options: TriggerFlyOptions) => void;
  removeFlyingItem: (id: string) => void;
  setCartBouncing: (bouncing: boolean) => void;
}

export const useFlyToCart = create<FlyToCartState>((set, get) => ({
  flyingItems: [],
  cartBouncing: false,

  triggerFly: ({ image, event, startElement, startX: customStartX, startY: customStartY }) => {
    if (typeof window === "undefined") return;

    // 1. تحديد نقطة الانطلاق (Start Position)
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (typeof customStartX === "number" && typeof customStartY === "number") {
      startX = customStartX;
      startY = customStartY;
    } else if (startElement) {
      const rect = startElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else if (event) {
      startX = event.clientX;
      startY = event.clientY;
    }

    // 2. تحديد نقطة الوصول إلى أيقونة السلة بالهيدر (Cart Icon Position)
    let endX = window.innerWidth > 768 ? 90 : 50;
    let endY = 32;

    const cartIcon = document.getElementById("header-cart-icon");
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      endX = cartRect.left + cartRect.width / 2;
      endY = cartRect.top + cartRect.height / 2;
    }

    const id = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem: FlyingItem = {
      id,
      image: image || "",
      startX,
      startY,
      endX,
      endY,
    };

    set((state) => ({
      flyingItems: [...state.flyingItems, newItem],
    }));
  },

  removeFlyingItem: (id: string) => {
    set((state) => ({
      flyingItems: state.flyingItems.filter((item) => item.id !== id),
    }));
  },

  setCartBouncing: (bouncing: boolean) => {
    set({ cartBouncing: bouncing });
  },
}));
