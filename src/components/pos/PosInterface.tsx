"use client";

import React, { useState, useRef, useEffect } from "react";
import { findProductByBarcode, submitPosSale } from "@/app/actions/pos";
import { usePosStore, PosItem } from "@/store/usePosStore";
import { useUIStore } from "@/store/useUIStore";
import { useSession } from "next-auth/react";
import { useToastStore } from "@/store/useToastStore";
import { PremiumCard } from "../ui/premium-card";
import { PremiumButton } from "../ui/premium-button";
import { Search, Barcode, Trash2, CreditCard, Banknote, Printer } from "lucide-react";

export function PosInterface() {
  const { lang } = useUIStore();
  const { cart, paymentMethod, setPaymentMethod, addItem, updateQuantity, removeItem, clearPosCart, getPosTotal } = usePosStore();
  const { data: session } = useSession();
  const { showToast } = useToastStore();

  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // جعل المؤشر يركز تلقائياً على حقل الباركود لتمكين المسح الفوري دون استخدام الماوس
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // تفعيل اختصارات لوحة المفاتيح لمساعدة الكاشير في العمل بشكل أسرع
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "F8") {
        e.preventDefault();
        handleCompleteSale();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, paymentMethod]);

  // دالة الاستدعاء عند مسح باركود جديد
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    setErrorMsg("");
    const res = await findProductByBarcode(barcodeInput.trim());

    if (res.success && res.product) {
      const prod = res.product;
      if (res.isVariant && res.variant) {
        addItem({
          productId: prod._id,
          variantSku: res.variant.sku,
          title: `${prod.title.ar} (${res.variant.weight})`,
          price: res.variant.price,
          stockLimit: res.variant.stock,
        });
      } else {
        addItem({
          productId: prod._id,
          title: prod.title.ar,
          price: prod.price,
          stockLimit: prod.stock,
        });
      }
      setBarcodeInput(""); // تصفير الحقل للمسح القادم فوراً
    } else {
      setErrorMsg(res.message || "لم يعثر على المنتج");
      setBarcodeInput("");
    }
  };

  // معالجة الضغط لإتمام الفاتورة
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMsg("");

    const payload = {
      items: cart,
      paymentMethod,
      subtotal: getPosTotal(),
      total: getPosTotal(),
      cashierId: (session?.user as any)?.id || "654cf2f0de3a0c001faabbcc", // الكود التعريفي للكاشير الفعلي أو الافتراضي
    };

    const res = await submitPosSale(payload);

    if (res.success) {
      setSuccessReceipt(res.orderNumber || "");
      clearPosCart();
    } else {
      setErrorMsg(res.message || "فشلت عملية البيع المباشر");
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 h-[calc(100vh-4rem)] bg-neutral-50 dark:bg-neutral-950">
      
      {/* القسم الرئيسي: سلة المشتريات للكاشير وبحث الباركود (8 أعمدة) */}
      <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-4">
        
        {/* شريط مسح الباركود الذكي */}
        <form onSubmit={handleBarcodeSubmit} className="relative">
          <Barcode className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="امسح الباركود ضوئياً أو ادخل رمز الـ SKU (F2 للتركيز)..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono tracking-wider"
          />
          <button type="submit" className="hidden" />
        </form>

        {/* عرض رسائل التنبيه والخطأ */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* جدول المنتجات المضافة لعربة الكاشير */}
        <PremiumCard hoverEffect={false} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-3 border-neutral-100 dark:border-neutral-900">
            <h2 className="text-sm font-bold text-neutral-500">المنتجات النشطة في الفاتورة</h2>
            <span className="text-xs bg-primary/5 text-primary px-3 py-1 rounded-full font-mono font-bold">
              {cart.length} أصناف مضافة
            </span>
          </div>

          <div className="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-900">
            {cart.map((item) => (
              <div key={item.productId + (item.variantSku || "")} className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{item.title}</h4>
                  <p className="text-[10px] font-mono text-neutral-400">SKU: {item.variantSku || "N/A"}</p>
                </div>

                {/* أزرار زيادة ونقصان الكمية السريعة للكاشير */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantSku)}
                    className="h-8 w-8 rounded-full bg-neutral-100 text-sm font-bold flex items-center justify-center hover:bg-neutral-200"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold font-mono w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantSku)}
                    className="h-8 w-8 rounded-full bg-neutral-100 text-sm font-bold flex items-center justify-center hover:bg-neutral-200"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-xs font-bold text-primary font-mono">
                    {item.price * item.quantity} د.م.
                  </span>
                  <button 
                    onClick={() => removeItem(item.productId, item.variantSku)}
                    className="text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="text-center py-20 text-neutral-400 text-xs">
                جاهز للمسح الضوئي. وجه قارئ الباركود نحو السلعة للبدء...
              </div>
            )}
          </div>
        </PremiumCard>
      </div>

      {/* لوحة تفاصيل الدفع وطباعة الفواتير (4 أعمدة) */}
      <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-4">
        
        {/* ملخص الحسابات وتأكيد الشراء */}
        <PremiumCard hoverEffect={false} className="p-6 space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold border-b pb-3 border-neutral-100 dark:border-neutral-900">
              إجمالي المعاملة الحالية
            </h3>

            {/* تفاصيل التكلفة */}
            <div className="space-y-4 mt-6">
              <div className="flex justify-between text-neutral-500 text-sm">
                <span>المجموع الفرعي</span>
                <span className="font-mono">{getPosTotal()} د.م.</span>
              </div>
              <div className="flex justify-between text-neutral-500 text-sm">
                <span>الضرائب والتوصيل</span>
                <span className="font-mono">0.00 د.م.</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-900 pt-4 text-lg font-extrabold text-neutral-800 dark:text-neutral-100">
                <span>المجموع الإجمالي</span>
                <span className="text-primary dark:text-accent font-mono">{getPosTotal()} د.م.</span>
              </div>
            </div>

            {/* خيارات طرق الدفع الفورية لكاشير المحل */}
            <div className="space-y-2 mt-8">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">طريقة الدفع في الفرع</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("cash_pos")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === "cash_pos"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-neutral-200/60 hover:bg-neutral-50"
                  }`}
                >
                  <Banknote className="h-4 w-4" />
                  <span>كاش / Espèces</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("card_pos")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-all ${
                    paymentMethod === "card_pos"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-neutral-200/60 hover:bg-neutral-50"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>بطاقة بنكية / Carte</span>
                </button>
              </div>
            </div>
          </div>

          {/* زر الدفع السريع والنهائي للفاتورة */}
          <PremiumButton
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || loading}
            variant="primary"
            className="w-full py-4 text-base font-bold shadow-premium-md"
          >
            {loading ? "جاري تسجيل المعاملة..." : "إتمام وتسجيل الفاتورة (F8)"}
          </PremiumButton>
        </PremiumCard>

        {/* عرض وتجهيز الفاتورة للطباعة فور نجاح المعاملة */}
        {successReceipt && (
          <PremiumCard hoverEffect={false} className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-800">فاتورة رقم: {successReceipt}</span>
              <p className="text-[10px] text-neutral-400">تم تسجيل المعاملة وخصم المخزون بنجاح.</p>
            </div>
            {/* محاكاة زر الطباعة لتخريج إيصال ورقي */}
            <button 
              onClick={() => {
                showToast(
                  lang === "ar" 
                    ? "إرسال أمر الطباعة المباشر إلى جهاز الـ Thermal Printer..." 
                    : "Envoi de l'ordre d'impression à l'imprimante thermique...", 
                  "info"
                );
                setSuccessReceipt(null);
              }}
              className="flex items-center gap-1 bg-white hover:bg-neutral-100 text-xs font-bold border rounded-lg px-3 py-2 text-neutral-700"
            >
              <Printer className="h-4 w-4" />
              <span>طباعة</span>
            </button>
          </PremiumCard>
        )}

      </div>
    </div>
  );
}