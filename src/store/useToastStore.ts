import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface ConfirmDialog {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastStore {
  toasts: Toast[];
  confirmDialog: ConfirmDialog | null;
  showToast: (message: string, type?: "success" | "error" | "info", duration?: number) => void;
  removeToast: (id: string) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  clearConfirm: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  confirmDialog: null,

  showToast: (message, type = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  showConfirm: (message, onConfirm, onCancel) => {
    set({
      confirmDialog: {
        message,
        onConfirm: () => {
          onConfirm();
          set({ confirmDialog: null });
        },
        onCancel: () => {
          if (onCancel) onCancel();
          set({ confirmDialog: null });
        },
      },
    });
  },

  clearConfirm: () => set({ confirmDialog: null }),
}));
