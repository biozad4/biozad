"use client";

import React, { useState, useEffect } from "react";
import { getAdminOrders, updateOrderStatus } from "@/app/actions/adminOrders";
import { useToastStore } from "@/store/useToastStore";
import { PremiumCard } from "../ui/premium-card";
import { Search, Filter, MapPin, Calendar, Clock, Package, Check, X, Truck, ChevronDown, ChevronUp, Clock4, ShieldCheck, Ban } from "lucide-react";

// ==========================================
// 1. مكون المرحلة الأولى: طور المعالجة (Processing)
// ==========================================
function ProcessingOrders({ 
  orders, 
  loading, 
  onStatusUpdate, 
  orderSource,
  selectedOrderId,
  setSelectedOrderId,
  handleCopyCoupon
}: any) {
  const list = orders.filter((o: any) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing");

  if (loading) return <div className="text-center py-8 text-neutral-500 text-xs">جاري التحميل...</div>;
  if (list.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-xs border border-dashed rounded-xl">
        لا توجد طلبات في طور المعالجة حالياً.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((order: any) => {
        const isSelected = selectedOrderId === order._id;
        return (
          <OrderCard 
            key={order._id}
            order={order}
            isSelected={isSelected}
            onToggle={() => setSelectedOrderId(isSelected ? null : order._id)}
            handleCopyCoupon={handleCopyCoupon}
            orderSource={orderSource}
          >
            {/* أزرار التحكم الخاصة بمرحلة المعالجة */}
            {order.source !== "pos" ? (
              <div className="pt-2">
                <span className="block text-[10px] font-bold text-neutral-400 mb-2">إجراءات المعالجة:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onStatusUpdate(order._id, "confirmed")}
                    disabled={order.status === "confirmed"}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-[10px] border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-3 w-3" />
                    <span>تأكيد الطلب (Confirm)</span>
                  </button>

                  <button
                    onClick={() => onStatusUpdate(order._id, "shipping")}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-[10px] border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 transition-all"
                  >
                    <Truck className="h-3 w-3" />
                    <span>بدء الشحن والتوصيل ⚡</span>
                  </button>

                  <button
                    onClick={() => onStatusUpdate(order._id, "cancelled")}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-[10px] border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-50 transition-all"
                  >
                    <X className="h-3 w-3" />
                    <span>إلغاء الطلب (Cancel)</span>
                  </button>
                </div>
              </div>
            ) : (
              <POSPlaceholder />
            )}
          </OrderCard>
        );
      })}
    </div>
  );
}

// ==========================================
// 2. مكون المرحلة الثانية: في التوصيل (Shipping)
// ==========================================
function ShippingOrders({ 
  orders, 
  loading, 
  onStatusUpdate, 
  orderSource,
  selectedOrderId,
  setSelectedOrderId,
  handleCopyCoupon
}: any) {
  const list = orders.filter((o: any) => o.status === "shipping");

  if (loading) return <div className="text-center py-8 text-neutral-500 text-xs">جاري التحميل...</div>;
  if (list.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-xs border border-dashed rounded-xl">
        لا توجد طلبات جاري شحنها حالياً.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((order: any) => {
        const isSelected = selectedOrderId === order._id;
        return (
          <OrderCard 
            key={order._id}
            order={order}
            isSelected={isSelected}
            onToggle={() => setSelectedOrderId(isSelected ? null : order._id)}
            handleCopyCoupon={handleCopyCoupon}
            orderSource={orderSource}
          >
            {/* أزرار التحكم الخاصة بمرحلة الشحن */}
            {order.source !== "pos" ? (
              <div className="pt-2">
                <span className="block text-[10px] font-bold text-neutral-400 mb-2">إجراءات التوصيل:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onStatusUpdate(order._id, "delivered")}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-[10px] border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 transition-all"
                  >
                    <Check className="h-3 w-3" />
                    <span>ثم التوصيل بنجاح (وزيادة النقاط) 🎉</span>
                  </button>

                  <button
                    onClick={() => onStatusUpdate(order._id, "cancelled")}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-[10px] border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-50 transition-all"
                  >
                    <X className="h-3 w-3" />
                    <span>إلغاء الطلب (Cancel)</span>
                  </button>

                  <button
                    onClick={() => onStatusUpdate(order._id, "pending")}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-[10px] border border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-neutral-100 transition-all"
                  >
                    <span>إعادة للمعالجة ↩</span>
                  </button>
                </div>
              </div>
            ) : (
              <POSPlaceholder />
            )}
          </OrderCard>
        );
      })}
    </div>
  );
}

// ==========================================
// 3. مكون المرحلة الثالثة: تم التوصيل (Delivered)
// ==========================================
function DeliveredOrders({ 
  orders, 
  loading, 
  orderSource,
  selectedOrderId,
  setSelectedOrderId,
  handleCopyCoupon
}: any) {
  const list = orders.filter((o: any) => o.status === "delivered");

  if (loading) return <div className="text-center py-8 text-neutral-500 text-xs">جاري التحميل...</div>;
  if (list.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-xs border border-dashed rounded-xl">
        لا توجد طلبات تم توصيلها.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((order: any) => {
        const isSelected = selectedOrderId === order._id;
        return (
          <OrderCard 
            key={order._id}
            order={order}
            isSelected={isSelected}
            onToggle={() => setSelectedOrderId(isSelected ? null : order._id)}
            handleCopyCoupon={handleCopyCoupon}
            orderSource={orderSource}
          >
            <div className="pt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>✓ هذا الطلب مُسلم بنجاح للزبون وتمت زيادة نقاط الولاء لحسابه.</span>
            </div>
          </OrderCard>
        );
      })}
    </div>
  );
}

// ==========================================
// 4. مكون المرحلة الرابعة: الطلبات الملغاة (Cancelled)
// ==========================================
function CancelledOrders({ 
  orders, 
  loading, 
  onStatusUpdate, 
  orderSource,
  selectedOrderId,
  setSelectedOrderId,
  handleCopyCoupon
}: any) {
  const list = orders.filter((o: any) => o.status === "cancelled");

  if (loading) return <div className="text-center py-8 text-neutral-500 text-xs">جاري التحميل...</div>;
  if (list.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-400 text-xs border border-dashed rounded-xl">
        لا يوجد طلبات ملغاة.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((order: any) => {
        const isSelected = selectedOrderId === order._id;
        return (
          <OrderCard 
            key={order._id}
            order={order}
            isSelected={isSelected}
            onToggle={() => setSelectedOrderId(isSelected ? null : order._id)}
            handleCopyCoupon={handleCopyCoupon}
            orderSource={orderSource}
          >
            {order.source !== "pos" ? (
              <div className="pt-2 flex flex-col gap-2">
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900 flex items-center gap-1.5">
                  <Ban className="h-4 w-4" />
                  <span>هذا الطلب ملغي بالكامل.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onStatusUpdate(order._id, "pending")}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg font-bold text-[10px] border border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-neutral-100 transition-all"
                  >
                    <span>إعادة تنشيط الطلب ↩</span>
                  </button>
                </div>
              </div>
            ) : (
              <POSPlaceholder />
            )}
          </OrderCard>
        );
      })}
    </div>
  );
}

// ==========================================
// 5. مكونات مساعدة مشتركة لعرض الكرت والتفاصيل
// ==========================================
function POSPlaceholder() {
  return (
    <div className="pt-2 text-[10px] text-neutral-400 font-bold bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-lg border">
      ℹ مبيعات المحل المباشرة (POS) تكون مكتملة ومسلمة بشكل تلقائي.
    </div>
  );
}

function OrderCard({ order, isSelected, onToggle, handleCopyCoupon, orderSource, children }: any) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900";
      case "shipping":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900";
      default:
        return "bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "قيد الانتظار";
      case "confirmed": return "مؤكد";
      case "preparing": return "جاري التجهيز";
      case "shipping": return "في التوصيل";
      case "delivered": return "تم التوصيل";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };

  return (
    <PremiumCard 
      hoverEffect={!isSelected} 
      className={`p-5 transition-all ${isSelected ? "border-primary/40 ring-1 ring-primary/10 shadow-premium-sm" : ""}`}
    >
      {/* الجزء العلوي السريع */}
      <div 
        onClick={onToggle}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer"
      >
        <div className="space-y-1.5 text-right w-full">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-sm text-primary dark:text-accent">
              {order.orderNumber}
            </span>
            <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${getStatusBadgeClass(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-neutral-500">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              👤 {order.source === "pos" ? `مبيعات POS (${order.cashier?.name || "الكاشير"})` : order.guestDetails?.name || "عميل زائر"}
            </span>
            <span>📍 {order.source === "pos" ? "شراء مباشر بالمحل" : order.guestDetails?.city || "الموقع غير محدد"}</span>
            {order.source !== "pos" && (
              <span>📞 {order.guestDetails?.phone || "-"}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="text-end">
            <span className="text-xs text-neutral-400 block">الإجمالي الكلي</span>
            <span className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100">
              {order.total} د.م.
            </span>
          </div>
          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-400">
            {isSelected ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* جزء التفاصيل الموسعة */}
      {isSelected && (
        <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-900 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs animate-fade-in text-right">
          
          {/* 1. معلومات الشحن والعميل */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-serif font-bold text-neutral-900 dark:text-white border-b pb-2 flex items-center gap-1.5 justify-end">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>بيانات الزبون والشحن</span>
            </h4>
            <div className="space-y-2.5 leading-relaxed text-neutral-600 dark:text-neutral-300">
              {order.source === "pos" ? (
                <>
                  <p><strong>طريقة البيع:</strong> شراء مباشر بالمحل (POS)</p>
                  <p><strong>الكاشير المسؤول:</strong> {order.cashier?.name || "غير محدد"} ({order.cashier?.email || "-"})</p>
                  <p><strong>طريقة الدفع:</strong> {order.paymentMethod === "cash_pos" ? "نقداً (Cash)" : "بطاقة بنكية (Card)"}</p>
                </>
              ) : (
                <>
                  <p><strong>الاسم:</strong> {order.guestDetails?.name}</p>
                  <p className="flex items-center gap-1 justify-end">
                    <a href={`tel:${order.guestDetails?.phone}`} className="text-primary hover:underline font-mono">
                      {order.guestDetails?.phone}
                    </a>
                    <strong> :الهاتف</strong> 
                  </p>
                  <p><strong>المدينة:</strong> {order.guestDetails?.city}</p>
                  <p><strong>العنوان السكني:</strong> {order.guestDetails?.address}</p>
                  {order.guestDetails?.notes && (
                    <div className="bg-amber-50/50 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-amber-100/50 text-[10px] text-amber-700">
                      <strong>ملاحظات العميل:</strong> {order.guestDetails.notes}
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center gap-3 text-[10px] text-neutral-400 pt-1 justify-end">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(order.createdAt).toLocaleDateString("ar-MA")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(order.createdAt).toLocaleTimeString("ar-MA", { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* 2. المنتجات المطلوبة والأسعار */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="font-serif font-bold text-neutral-900 dark:text-white border-b pb-2 flex items-center gap-1.5 justify-end">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span>تفاصيل المنتجات المطلوبة</span>
            </h4>
            <div className="space-y-3">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/20 p-2.5 rounded-xl border">
                  <div className="space-y-0.5 text-right">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {item.title}
                    </span>
                    {item.variantSku && (
                      <p className="text-[9px] text-neutral-400">SKU: {item.variantSku}</p>
                    )}
                  </div>
                  <div className="text-end font-mono">
                    <span className="font-bold block">{item.quantity} × {item.price} د.م.</span>
                    <span className="text-[10px] text-neutral-400">{item.price * item.quantity} د.م.</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ملخص الفاتورة */}
            <div className="bg-neutral-50 dark:bg-neutral-900/30 p-3 rounded-xl space-y-1.5 text-[11px] font-medium border">
              <div className="flex justify-between text-neutral-500">
                <span>{order.subtotal} د.م.</span>
                <span>:المجموع الفرعي</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>-{order.discountAmount} د.م.</span>
                  <span>:الخصم المطبق</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>{order.shippingCost === 0 ? "مجاني" : `${order.shippingCost} د.م.`}</span>
                <span>:تكلفة التوصيل</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-neutral-950 dark:text-white border-t pt-2 mt-1.5">
                <span className="text-primary">{order.total} د.م.</span>
                <span>:المجموع الكلي</span>
              </div>
            </div>

            {/* الإجراءات الممررة كأبناء */}
            {children}

          </div>

        </div>
      )}
    </PremiumCard>
  );
}

// ==========================================
// 6. المكون الأساسي لإدارة وتتبع طلبيات العملاء
// ==========================================
export function OrdersManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderSource, setOrderSource] = useState<"website" | "pos">("website");
  const [activeStage, setActiveStage] = useState<"processing" | "shipping" | "delivered" | "cancelled">("processing");
  const { showToast } = useToastStore();

  const loadOrders = async () => {
    setLoading(true);
    const res = await getAdminOrders();
    if (res.success && res.orders) {
      setOrders(res.orders);
    } else {
      showToast(res.message || "فشل جلب الطلبيات", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    // قراءة المرحلة من الرابط URL (لينك خاص بكل مرحلة)
    const params = new URLSearchParams(window.location.search);
    const stageParam = params.get("stage");
    if (stageParam === "processing" || stageParam === "shipping" || stageParam === "delivered" || stageParam === "cancelled") {
      setActiveStage(stageParam);
    }
  }, []);

  const handleStageChange = (stage: "processing" | "shipping" | "delivered" | "cancelled") => {
    setActiveStage(stage);
    setSelectedOrderId(null);
    const url = new URL(window.location.href);
    url.searchParams.set("stage", stage);
    window.history.pushState({}, "", url.toString());
  };

  const handleStatusUpdate = async (orderId: string, newStatus: any) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      showToast(res.message || "تم تحديث الحالة", "success");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      showToast(res.message || "فشل تحديث الحالة", "error");
    }
  };

  // تصفية وبحث الطلبيات
  const filteredOrders = orders.filter((order) => {
    const isPos = order.source === "pos";
    const matchesSource = orderSource === "pos" ? isPos : !isPos;

    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.guestDetails?.name || "عميل POS").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.guestDetails?.phone || "").includes(searchTerm) ||
      (order.guestDetails?.city || "المحل").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.cashier?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && matchesSource;
  });

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast("تم نسخ كود الخصم بنجاح! 📋", "success");
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-right w-full sm:w-auto">
          <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2 justify-end">
            <span>إدارة وتتبع طلبيات العملاء</span>
            <Package className="h-5 w-5 text-primary" />
          </h2>
          <p className="text-xs text-neutral-500 mt-1">تتبع الحالات الثلاث لطلبات المتجر وتحديث نقاط الولاء تلقائياً.</p>
        </div>
        <button 
          onClick={loadOrders} 
          className="text-xs font-bold text-primary hover:underline bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg shrink-0"
        >
          🔄 تحديث الطلبات
        </button>
      </div>

      {/* تبويبات الفرز المصدر: أونلاين vs POS */}
      <div className="flex gap-2 border-b pb-1 border-neutral-200/60 dark:border-neutral-800 justify-end">
        <button
          onClick={() => {
            setOrderSource("pos");
            setSelectedOrderId(null);
          }}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            orderSource === "pos"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          🏪 مبيعات نقاط البيع والمحل (POS Store)
        </button>
        <button
          onClick={() => {
            setOrderSource("website");
            setSelectedOrderId(null);
          }}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            orderSource === "website"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          🌐 طلبيات المتجر الإلكتروني (Online)
        </button>
      </div>

      {/* تبويبات المراحل الثلاث المستقلة مع لينكاتها (Link tabs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-neutral-50 dark:bg-neutral-900/50 p-1.5 rounded-xl border">
        <button
          onClick={() => handleStageChange("processing")}
          className={`py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeStage === "processing"
              ? "bg-white dark:bg-neutral-950 text-primary shadow-sm border border-neutral-100 dark:border-neutral-800"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Clock4 className="h-4 w-4 text-amber-500" />
          <span>المرحلة 1: طور المعالجة</span>
        </button>
        <button
          onClick={() => handleStageChange("shipping")}
          className={`py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeStage === "shipping"
              ? "bg-white dark:bg-neutral-950 text-primary shadow-sm border border-neutral-100 dark:border-neutral-800"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Truck className="h-4 w-4 text-indigo-500 animate-pulse" />
          <span>المرحلة 2: في التوصيل</span>
        </button>
        <button
          onClick={() => handleStageChange("delivered")}
          className={`py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeStage === "delivered"
              ? "bg-white dark:bg-neutral-950 text-primary shadow-sm border border-neutral-100 dark:border-neutral-800"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Check className="h-4 w-4 text-emerald-500" />
          <span>المرحلة 3: تم التوصيل</span>
        </button>
        <button
          onClick={() => handleStageChange("cancelled")}
          className={`py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeStage === "cancelled"
              ? "bg-white dark:bg-neutral-950 text-primary shadow-sm border border-neutral-100 dark:border-neutral-800"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <X className="h-4 w-4 text-rose-500" />
          <span>الطلبات الملغاة</span>
        </button>
      </div>

      {/* شريط البحث */}
      <div className="relative">
        <input
          type="text"
          placeholder={orderSource === "pos" ? "ابحث برقم الفاتورة، أو الكاشير..." : "ابحث برقم الطلبية، الاسم، المدينة، أو الهاتف..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-right"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
      </div>

      {/* عرض مكون المرحلة المختارة */}
      {activeStage === "processing" && (
        <ProcessingOrders 
          orders={filteredOrders} 
          loading={loading} 
          onStatusUpdate={handleStatusUpdate} 
          orderSource={orderSource}
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          handleCopyCoupon={handleCopyCoupon}
        />
      )}
      {activeStage === "shipping" && (
        <ShippingOrders 
          orders={filteredOrders} 
          loading={loading} 
          onStatusUpdate={handleStatusUpdate} 
          orderSource={orderSource}
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          handleCopyCoupon={handleCopyCoupon}
        />
      )}
      {activeStage === "delivered" && (
        <DeliveredOrders 
          orders={filteredOrders} 
          loading={loading} 
          orderSource={orderSource}
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          handleCopyCoupon={handleCopyCoupon}
        />
      )}
      {activeStage === "cancelled" && (
        <CancelledOrders 
          orders={filteredOrders} 
          loading={loading} 
          onStatusUpdate={handleStatusUpdate} 
          orderSource={orderSource}
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          handleCopyCoupon={handleCopyCoupon}
        />
      )}
    </div>
  );
}
