"use client";

import React, { useEffect, useState } from "react";
import { getInventoryHistoryAndStats, adjustProductStock } from "@/app/actions/inventory";
import { getAdminProducts } from "@/app/actions/adminProducts";
import { useToastStore } from "@/store/useToastStore";
import { PremiumCard } from "../ui/premium-card";
import { PremiumButton } from "../ui/premium-button";
import { PremiumSkeleton } from "../ui/premium-skeleton";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Plus, Minus, History, Package } from "lucide-react";

export function InventoryManagement() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [productsList, setProductsList] = useState<any[]>([]);
  const { showToast } = useToastStore();

  // حالات فورم تعديل المخزون اليدوي
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    type: "refill" as "refill" | "manual_adjustment",
    notes: "",
  });

  const loadInventoryData = async () => {
    setLoading(true);
    const res = await getInventoryHistoryAndStats();
    const prodRes = await getAdminProducts();
    
    if (res.success) setData(res);
    if (prodRes.success && prodRes.products) setProductsList(prodRes.products);
    setLoading(false);
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !form.quantity) return;

    setSubmitting(true);
    const res = await adjustProductStock({
      productId: form.productId,
      quantity: Number(form.quantity),
      type: form.type,
      notes: form.notes,
    });

    if (res.success) {
      showToast(res.message, "success");
      setForm({ productId: "", quantity: "", type: "refill", notes: "" });
      loadInventoryData(); // إعادة تحميل السجلات الإحصائية المحدثة
    } else {
      showToast(res.message || "حدث خطأ أثناء تعديل المخزون", "error");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <PremiumSkeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <PremiumSkeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  // مصفوفة نوع حركات المخزون للترجمة
  const movementLabels: Record<string, { label: string, color: string }> = {
    website_sale: { label: "طلب موقع ويب / Web", color: "bg-blue-50 text-blue-600" },
    pos_sale: { label: "بيع مباشر كاشير / POS", color: "bg-purple-50 text-purple-600" },
    refill: { label: "شحن مخزون جديد / Refill", color: "bg-emerald-50 text-emerald-600" },
    manual_adjustment: { label: "تعديل إداري / Adjust", color: "bg-amber-50 text-amber-600" },
    return: { label: "إرجاع سلعة / Return", color: "bg-teal-50 text-teal-600" },
    cancelled_order: { label: "طلب ملغى / Cancelled", color: "bg-neutral-100 text-neutral-500" },
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      
      {/* 1. الإحصائيات السريعة للقطع والمخزون */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PremiumCard hoverEffect={false} className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">إجمالي المنتجات المسجلة</span>
            <h3 className="text-2xl font-serif font-extrabold text-neutral-800">{data?.stats.totalProducts}</h3>
          </div>
          <div className="p-3 bg-neutral-100 rounded-xl"><Package className="h-6 w-6 text-neutral-600" /></div>
        </PremiumCard>

        <PremiumCard hoverEffect={false} className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">إجمالي الوحدات بالمستودع</span>
            <h3 className="text-2xl font-serif font-extrabold text-emerald-700">{data?.stats.totalStockUnits} وحدة</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl"><ArrowUpRight className="h-6 w-6 text-emerald-600" /></div>
        </PremiumCard>

        <PremiumCard hoverEffect={false} className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">السلع النفدت من المخزن</span>
            <h3 className="text-2xl font-serif font-extrabold text-rose-600">{data?.stats.outOfStockCount} سلع</h3>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl"><ArrowDownRight className="h-6 w-6 text-rose-600" /></div>
        </PremiumCard>
      </div>

      {/* 2. شحن المخزون اليدوي وسجل العمليات جنباً إلى جنب */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* نموذج شحن/تعديل بضائع المستودع (5 أعمدة) */}
        <div className="lg:col-span-5">
          <PremiumCard hoverEffect={false} className="p-6 space-y-4">
            <h3 className="text-sm font-bold border-b pb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-accent" />
              <span>شحن وتعديل بضائع المخازن يدوياً</span>
            </h3>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-neutral-500">اختر السلعة لتعديل كميتها</label>
                <select
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="w-full border rounded-xl p-3 bg-white"
                >
                  <option value="">-- حدد السلعة المستهدفة --</option>
                  {productsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title.ar} (المتوفر حالياً: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-neutral-500">الكمية المراد إدخالها/خصمها</label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 50 للزيادة، -10 للخصم"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full border rounded-xl p-3 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-500">طبيعة التحديث</label>
                  <select
                    value={form.type}
                    onChange={(e: any) => setForm({ ...form, type: e.target.value })}
                    className="w-full border rounded-xl p-3 bg-white"
                  >
                    <option value="refill">شحن بضائع جديدة (زيادة)</option>
                    <option value="manual_adjustment">تصحيح وجرد يدوي (تعديل)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-500">ملاحظات وسبب التعديل</label>
                <input
                  type="text"
                  placeholder="مثال: وصول الشحنة الأسبوعية من تعاونية الأطلس"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border rounded-xl p-3 text-xs"
                />
              </div>

              <PremiumButton type="submit" loading={submitting} variant="primary" className="w-full py-3.5 text-xs">
                حفظ التحديث وتوثيق الحركة
              </PremiumButton>
            </form>
          </PremiumCard>
        </div>

        {/* السجل اللحظي والتاريخي لحركات المستودع الموحد (7 أعمدة) */}
        <div className="lg:col-span-7">
          <PremiumCard hoverEffect={false} className="p-6 space-y-4">
            <h3 className="text-sm font-bold border-b pb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span>سجلات حركة المخزن اللحظية (موقع الويب + الكاشير)</span>
            </h3>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-900 max-h-[400px] overflow-y-auto pr-1">
              {data?.movements.map((move: any) => {
                const labelConfig = movementLabels[move.type] || { label: move.type, color: "bg-neutral-50 text-neutral-600" };
                const isPositive = move.quantity > 0;

                return (
                  <div key={move._id} className="flex justify-between items-center py-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-neutral-800">{move.product?.title?.ar || "منتج محذوف"}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${labelConfig.color}`}>
                          {labelConfig.label}
                        </span>
                        <span className="text-[10px] text-neutral-400">بواسطة: {move.performedBy?.name || "النظام التلقائي"}</span>
                      </div>
                      {move.notes && <p className="text-[10px] text-neutral-400 italic mt-0.5">💬 {move.notes}</p>}
                    </div>

                    <div className="text-end">
                      <span className={`font-mono font-bold text-sm ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {isPositive ? `+${move.quantity}` : move.quantity} وحدة
                      </span>
                      <span className="block text-[9px] text-neutral-400 mt-1">
                        {new Date(move.createdAt).toLocaleDateString("ar-MA", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {data?.movements.length === 0 && (
                <div className="text-center py-20 text-xs text-neutral-400">لا يوجد أي حركات مخزون مسجلة بعد.</div>
              )}
            </div>
          </PremiumCard>
        </div>

      </div>

    </div>
  );
}