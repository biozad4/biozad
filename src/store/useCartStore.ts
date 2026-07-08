import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  variantSku?: string;
  title: { ar: string; fr: string };
  price: number;
  image: string;
  weight?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, variantSku?: string) => void;
  updateQuantity: (id: string, quantity: number, variantSku?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.id === newItem.id && item.variantSku === newItem.variantSku
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === newItem.id && item.variantSku === newItem.variantSku
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...newItem, quantity: 1 }] });
        }
      },
      removeItem: (id, variantSku) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.variantSku === variantSku)
          ),
        });
      },
      updateQuantity: (id, quantity, variantSku) => {
        if (quantity <= 0) {
          get().removeItem(id, variantSku);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id && item.variantSku === variantSku
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: "biozad-cart-storage", // الاسم المحفوظ في التخزين المحلي للمتصفح
    }
  )
);