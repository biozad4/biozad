import { create } from "zustand";

export interface PosItem {
  productId: string;
  variantSku?: string;
  title: string;
  price: number;
  quantity: number;
  stockLimit: number;
}

interface PosStore {
  cart: PosItem[];
  paymentMethod: "cash_pos" | "card_pos";
  setPaymentMethod: (method: "cash_pos" | "card_pos") => void;
  addItem: (item: Omit<PosItem, "quantity">) => void;
  removeItem: (productId: string, variantSku?: string) => void;
  updateQuantity: (productId: string, qty: number, variantSku?: string) => void;
  clearPosCart: () => void;
  getPosTotal: () => number;
}

export const usePosStore = create<PosStore>((set, get) => ({
  cart: [],
  paymentMethod: "cash_pos",
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  addItem: (newItem) => {
    const cart = get().cart;
    const existing = cart.find(
      (item) => item.productId === newItem.productId && item.variantSku === newItem.variantSku
    );

    if (existing) {
      // التأكد من عدم تجاوز المخزون المتوفر عند الإضافة المتكررة
      if (existing.quantity >= newItem.stockLimit) return;
      
      set({
        cart: cart.map((item) =>
          item.productId === newItem.productId && item.variantSku === newItem.variantSku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { ...newItem, quantity: 1 }] });
    }
  },
  removeItem: (productId, variantSku) => {
    set({
      cart: get().cart.filter(
        (item) => !(item.productId === productId && item.variantSku === variantSku)
      ),
    });
  },
  updateQuantity: (productId, qty, variantSku) => {
    if (qty <= 0) {
      get().removeItem(productId, variantSku);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.productId === productId && item.variantSku === variantSku
          ? { ...item, quantity: qty }
          : item
      ),
    });
  },
  clearPosCart: () => set({ cart: [], paymentMethod: "cash_pos" }),
  getPosTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));