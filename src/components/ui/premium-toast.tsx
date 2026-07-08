"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import { CheckCircle, AlertTriangle, Info, X, HelpCircle } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

export function PremiumToast() {
  const { toasts, removeToast, confirmDialog } = useToastStore();
  const { lang } = useUIStore();

  const getIcon = (type: "success" | "error" | "info") => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: "success" | "error" | "info") => {
    switch (type) {
      case "success":
        return "bg-white/95 dark:bg-neutral-900/95 border-emerald-500/20 shadow-emerald-500/5";
      case "error":
        return "bg-white/95 dark:bg-neutral-900/95 border-rose-500/20 shadow-rose-500/5";
      case "info":
      default:
        return "bg-white/95 dark:bg-neutral-900/95 border-blue-500/20 shadow-blue-500/5";
    }
  };

  return (
    <>
      {/* 1. قائمة الإشعارات المنبثقة (Toasts container) */}
      <div className="fixed top-4 left-4 right-4 z-9999 pointer-events-none flex flex-col items-center sm:items-end gap-3 max-w-sm mx-auto sm:mr-4 sm:ml-auto">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md shadow-premium-lg pointer-events-auto ${getBgColor(
                toast.type
              )}`}
            >
              <div className="flex items-center gap-3">
                {getIcon(toast.type)}
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. صندوق تأكيد الإجراءات التفاعلي (Confirm Dialog) */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            {/* الخلفية المظلمة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={confirmDialog.onCancel}
              className="fixed inset-0 bg-black"
            />

            {/* بطاقة التأكيد الزجاجية الفاخرة */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-[2rem] p-6 shadow-premium-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center gap-5 z-10"
            >
              <div className="h-12 w-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <HelpCircle className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {lang === "ar" ? "تأكيد الإجراء" : "Confirmer l'action"}
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>

              <div className="flex w-full gap-3">
                <button
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 bg-primary hover:bg-primary/95 text-white text-xs font-bold py-3.5 rounded-full shadow-premium-md transition-all active:scale-[0.98]"
                >
                  {lang === "ar" ? "تأكيد" : "Confirmer"}
                </button>
                <button
                  onClick={confirmDialog.onCancel}
                  className="flex-1 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-bold py-3.5 rounded-full transition-all active:scale-[0.98]"
                >
                  {lang === "ar" ? "إلغاء" : "Annuler"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
