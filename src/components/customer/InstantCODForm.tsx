"use client";

import React, { useState } from "react";
import { createOrder } from "@/app/actions/orders";
import { useToastStore } from "@/store/useToastStore";
import { PremiumButton } from "../ui/premium-button";
import { CheckCircle2, Truck, ShieldCheck, Phone, User, MapPin, FileText, Sparkles, MessageCircle } from "lucide-react";
import * as pixel from "@/lib/pixel";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";

export const MOROCCAN_CITIES = [
  "الدار البيضاء (Casablanca)",
  "الرباط (Rabat)",
  "سلا (Salé)",
  "مراكش (Marrakech)",
  "فاس (Fès)",
  "طنجة (Tanger)",
  "أكادير (Agadir)",
  "وجدة (Oujda)",
  "القنيطرة (Kénitra)",
  "تطوان (Tétouan)",
  "تمارة (Témara)",
  "آسفي (Safi)",
  "العيون (Laâyoune)",
  "المحمدية (Mohammedia)",
  "خريبكة (Khouribga)",
  "الجديدة (El Jadida)",
  "بني ملال (Béni Mellal)",
  "الناظور (Nador)",
  "تازة (Taza)",
  "ورزازات (Ouarzazate)",
  "الحسيمة (Al Hoceïma)",
  "تارودانت (Taroudant)",
  "الداخلة (Dakhla)",
  "مكناس (Meknès)",
  "بركان (Berkane)",
  "سطات (Settat)",
  "أزيلال (Azilal)",
  "خنيفرة (Khénifra)",
  "كلميم (Guelmim)",
  "الصويرة (Essaouira)",
  "تزنيت (Tiznit)",
  "مدينة أخرى (Autre ville)"
];

export interface SelectedOffer {
  id: string;
  title: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  freeShipping?: boolean;
  badge?: string;
}

interface InstantCODFormProps {
  productId: string;
  productTitle: string;
  selectedOffer: SelectedOffer;
  landingPageTitle: string;
  pixelId?: string;
  onSuccess?: (orderNumber: string) => void;
}

export function InstantCODForm({
  productId,
  productTitle,
  selectedOffer,
  landingPageTitle,
  pixelId,
  onSuccess,
}: InstantCODFormProps) {
  const { showToast } = useToastStore();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successOrderNum, setSuccessOrderNum] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(MOROCCAN_CITIES[0]);
  const [customCity, setCustomCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const finalCity = city === "مدينة أخرى (Autre ville)" ? customCity.trim() || "المغرب" : city.split(" (")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // التحقق من رقم الهاتف المغربي
    const cleanPhone = phone.replace(/\s+/g, "").replace(/-/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام (مثال: 0612345678)");
      setLoading(false);
      return;
    }

    if (!address.trim() || address.trim().length < 3) {
      setErrorMsg("يرجى كتابة الحي أو العنوان بشكل تقريبي لتسهيل التوصيل");
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      phone: cleanPhone,
      city: finalCity,
      address: address.trim(),
      notes: notes.trim() ? `[صفحة هبوط: ${landingPageTitle}] - ${notes.trim()}` : `[صفحة هبوط: ${landingPageTitle}]`,
      items: [
        {
          id: productId || "biozad-lp-item",
          title: {
            ar: `${productTitle} (${selectedOffer.title})`,
            fr: `${productTitle} (${selectedOffer.title})`,
          },
          quantity: selectedOffer.quantity || 1,
          price: selectedOffer.price / (selectedOffer.quantity || 1),
        },
      ],
    };

    const res = await createOrder(payload);

    if (res.success && res.orderNumber) {
      const orderNum = res.orderNumber;
      setSuccessOrderNum(orderNum);

      // توليد رابط الواتساب المحتوي على الرسالة المنسقة الشاملة
      const waUrl = getWhatsAppOrderUrl({
        orderNumber: orderNum,
        customerName: name.trim(),
        phone: cleanPhone,
        city: finalCity,
        address: address.trim(),
        notes: notes.trim(),
        items: [
          {
            title: `${productTitle} (${selectedOffer.title})`,
            quantity: selectedOffer.quantity || 1,
            price: selectedOffer.price,
          },
        ],
        total: selectedOffer.price,
      });

      // فتح محادثة الواتساب تلقائياً في نافذة جديدة
      if (typeof window !== "undefined") {
        try {
          window.open(waUrl, "_blank");
        } catch (e) {
          console.warn("Could not auto-open WhatsApp popup:", e);
        }
      }

      // إطلاق أحداث فيسبوك بيكسل (Purchase & Lead)
      pixel.trackPurchase(selectedOffer.price, "MAD", {
        content_name: productTitle,
        content_ids: [productId],
        num_items: selectedOffer.quantity || 1,
        order_id: orderNum,
      });
      pixel.trackLead(selectedOffer.price, "MAD", {
        content_name: productTitle,
        order_id: orderNum,
      });

      if (onSuccess) {
        onSuccess(orderNum);
      }
      showToast("🎉 تم تسجيل طلبك بنجاح! تم تجهيز محادثة الواتساب لتأكيد الشحن.", "success");
    } else {
      if (res.errors) {
        const firstError = Object.values(res.errors)[0] as string[];
        setErrorMsg(firstError?.[0] || "يرجى التحقق من صحة البيانات المدخلة");
      } else {
        setErrorMsg(res.message || "حدث خطأ أثناء تأكيد الطلب، يرجى المحاولة ثانية.");
      }
    }

    setLoading(false);
  };

  if (successOrderNum) {
    const waUrl = getWhatsAppOrderUrl({
      orderNumber: successOrderNum,
      customerName: name.trim(),
      phone: phone.trim(),
      city: finalCity,
      address: address.trim(),
      notes: notes.trim(),
      items: [
        {
          title: `${productTitle} (${selectedOffer.title})`,
          quantity: selectedOffer.quantity || 1,
          price: selectedOffer.price,
        },
      ],
      total: selectedOffer.price,
    });

    return (
      <div className="bg-white dark:bg-neutral-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-premium-lg">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
            <Sparkles className="h-3.5 w-3.5" />
            <span>تم استلام وتأكيد طلبك بنجاح!</span>
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
            شكراً لثقتك بمنتجات BioZad الأصيلة
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            تم فتح محادثة الواتساب لتأكيد طلبك مباشرة مع مسؤول الشحن، أو يمكنك الضغط على الزر أدناه:
          </p>
        </div>

        <div className="bg-[#FAF9F6] dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl max-w-sm mx-auto space-y-1">
          <span className="text-[11px] text-neutral-400 block font-bold uppercase tracking-wider">
            رقم الطلب الخاص بك
          </span>
          <span className="text-2xl font-mono font-black text-primary dark:text-accent tracking-widest block">
            {successOrderNum}
          </span>
          <span className="text-xs font-semibold text-neutral-500 block pt-1">
            المبلغ المطلوب عند الاستلام: <strong className="text-neutral-900 dark:text-white">{selectedOffer.price} د.م.</strong>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-[#25D366]/30 transition-all active:scale-95 animate-pulse"
          >
            <MessageCircle className="h-5 w-5" />
            <span>تأكيد طلبيتي فوراً عبر الواتساب 💬</span>
          </a>
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs transition-all"
          >
            <span>تصفح الموقع الرئيسي</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div id="cod-order-form" className="bg-white dark:bg-neutral-900 border-2 border-primary/20 dark:border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-premium-lg space-y-6">
      
      {/* عنوان الاستمارة الفاخر */}
      <div className="text-center space-y-2 border-b border-neutral-100 dark:border-neutral-800 pb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-black uppercase tracking-wider">
          <Truck className="h-3.5 w-3.5" />
          <span>توصيل سريع مجاني • الدفع نقداً عند الاستلام</span>
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
          استمارة الطلب المباشر بنقرة واحدة
        </h3>
        <p className="text-xs text-neutral-500">
          املأ بياناتك أدناه وسيتكفل موظفونا بالباقي لتصلك طلبيتك في أسرع وقت.
        </p>
      </div>

      {/* ملخص العرض المختار */}
      <div className="p-4 rounded-2xl bg-primary/[0.03] dark:bg-neutral-950 border border-primary/10 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">العرض الذي اخترته:</span>
          <span className="text-sm font-black text-neutral-900 dark:text-white block">{selectedOffer.title}</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Truck className="h-3 w-3" /> التوصيل: {selectedOffer.freeShipping !== false ? "مجاني لكافة المدن" : "شحن سريع"}
          </span>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-2xl font-serif font-black text-primary dark:text-accent font-mono block">
            {selectedOffer.price} <span className="text-xs font-sans">د.م.</span>
          </span>
          {selectedOffer.compareAtPrice && selectedOffer.compareAtPrice > selectedOffer.price && (
            <span className="text-xs text-neutral-400 line-through font-mono block">
              {selectedOffer.compareAtPrice} د.م.
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl border border-rose-200 dark:border-rose-900">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* حقول الإدخال السريعة */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
        
        {/* الاسم الكامل */}
        <div className="space-y-1.5">
          <label className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary dark:text-accent" />
            <span>الاسم الكامل (Nom Complet) *</span>
          </label>
          <input
            type="text"
            required
            placeholder="مثال: محمد العلوي"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-2xl p-3.5 text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* رقم الهاتف */}
        <div className="space-y-1.5">
          <label className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-primary dark:text-accent" />
            <span>رقم الهاتف للتواصل وتأكيد الشحن (Téléphone) *</span>
          </label>
          <input
            type="tel"
            required
            dir="ltr"
            placeholder="06XXXXXXXX أو 07XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-2xl p-3.5 text-xs text-right font-mono bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* اختيار المدينة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary dark:text-accent" />
              <span>المدينة (Ville) *</span>
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border rounded-2xl p-3.5 text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:bg-white"
            >
              {MOROCCAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* العنوان أو الحي */}
          <div className="space-y-1.5">
            <label className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary dark:text-accent" />
              <span>الحي أو العنوان (Quartier / Adresse) *</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: حي الرياض، قرب صيدلية..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-2xl p-3.5 text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {city === "مدينة أخرى (Autre ville)" && (
          <div className="space-y-1.5">
            <label className="text-neutral-700 dark:text-neutral-300">اكتب اسم مدينتك هنا *</label>
            <input
              type="text"
              required
              placeholder="اسم مدينتك أو قريتك..."
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              className="w-full border rounded-2xl p-3.5 text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:bg-white"
            />
          </div>
        )}

        {/* ملاحظات إضافية اختيارية */}
        <div className="space-y-1.5">
          <label className="text-neutral-500 dark:text-neutral-400">ملاحظة إضافية للموزع (اختياري)</label>
          <input
            type="text"
            placeholder="مثال: يرجى الاتصال بي بعد الساعة 3 زوالاً..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-2xl p-3 text-xs bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 focus:bg-white"
          />
        </div>

        {/* زر الإرسال المباشر والبارز بنقرة واحدة */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-600/25 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>جاري إرسال وتأكيد الطلب...</span>
              </span>
            ) : (
              <>
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span>اضغط هنا لإتمام الطلب • الدفع عند الاستلام</span>
              </>
            )}
          </button>
        </div>

        {/* شارات الأمان والثقة تحت الزر */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>معاينة المنتج قبل الدفع</span>
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span>توصيل لكافة مدن المغرب</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            <span>ضمان الجودة 100%</span>
          </span>
        </div>

      </form>
    </div>
  );
}
