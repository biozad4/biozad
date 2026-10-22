"use client";

import React, { useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { createOrder } from "@/app/actions/orders";
import { validateCouponCode } from "@/app/actions/coupons";
import { useToastStore } from "@/store/useToastStore";
import { PremiumButton } from "../ui/premium-button";
import { PremiumCard } from "../ui/premium-card";
import { Truck, CheckCircle2, AlertCircle, ShoppingBag, MessageCircle } from "lucide-react";
import * as pixel from "@/lib/pixel";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";

const MOROCCAN_CITIES = [
  { ar: "الدار البيضاء", fr: "Casablanca" },
  { ar: "الرباط", fr: "Rabat" },
  { ar: "سلا", fr: "Salé" },
  { ar: "مراكش", fr: "Marrakech" },
  { ar: "فاس", fr: "Fès" },
  { ar: "طنجة", fr: "Tanger" },
  { ar: "أكادير", fr: "Agadir" },
  { ar: "وجدة", fr: "Oujda" },
  { ar: "القنيطرة", fr: "Kénitra" },
  { ar: "تطوان", fr: "Tétouan" },
  { ar: "تمارة", fr: "Témara" },
  { ar: "آسفي", fr: "Safi" },
  { ar: "العيون", fr: "Laâyoune" },
  { ar: "الداخلة", fr: "Dakhla" },
  { ar: "المحمدية", fr: "Mohammedia" },
  { ar: "خريبكة", fr: "Khouribga" },
  { ar: "الجديدة", fr: "El Jadida" },
  { ar: "بني ملال", fr: "Béni Mellal" },
  { ar: "الناظور", fr: "Nador" },
  { ar: "تازة", fr: "Taza" },
  { ar: "ورزازات", fr: "Ouarzazate" },
  { ar: "الحسيمة", fr: "Al Hoceïma" },
  { ar: "تارودانت", fr: "Taroudant" },
];

interface CheckoutFormProps {
  settings?: {
    shippingCost: number;
    freeShippingMin: number;
    isFreeShippingGlobally: boolean;
    whatsappNumber?: string;
  };
}

export function CheckoutForm({ settings }: CheckoutFormProps) {
  const { lang } = useUIStore();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { showToast } = useToastStore();
  
  const activeSettings = settings || {
    shippingCost: 40,
    freeShippingMin: 400,
    isFreeShippingGlobally: false,
  };

  // حالات تتبع نجاح أو فشل الطلب
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successOrderNum, setSuccessOrderNum] = useState("");
  const [successWaUrl, setSuccessWaUrl] = useState("");

  // حالات الكوبونات لكل منتج
  const [couponInputs, setCouponInputs] = useState<Record<string, string>>({});
  const [appliedCoupons, setAppliedCoupons] = useState<Record<string, { coupon: any; discountAmount: number }>>({});

  // حالات الإدخال يدوياً
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");

  const subtotal = getCartTotal();
  const totalDiscount = Object.values(appliedCoupons).reduce((sum, current) => sum + current.discountAmount, 0);
  const shippingCost = activeSettings.isFreeShippingGlobally
    ? 0
    : (subtotal - totalDiscount) >= activeSettings.freeShippingMin || (subtotal - totalDiscount) === 0
    ? 0
    : activeSettings.shippingCost;
  const total = Math.max(0, subtotal - totalDiscount + shippingCost);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCity(val);
    if (val !== "other") {
      setFormData((prev) => ({ ...prev, city: val }));
    } else {
      setFormData((prev) => ({ ...prev, city: customCity }));
    }
  };

  const handleCustomCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomCity(val);
    setFormData((prev) => ({ ...prev, city: val }));
  };

  const handleApplyCoupon = async (item: any) => {
    const itemKey = item.id + (item.variantSku || "");
    const code = couponInputs[itemKey]?.trim();
    if (!code) return;

    const res = await validateCouponCode(code);
    if (!res.success || !res.coupon) {
      showToast(res.message || "كود الخصم غير صالح", "error");
      return;
    }

    const coupon = res.coupon;

    // التحقق من شروط الكوبون:
    if (coupon.appliesToType === "product" && coupon.targetProductId !== item.id) {
      showToast(lang === "ar" ? "هذا الكوبون غير مخصص لهذا المنتج" : "Ce coupon n'est pas valide pour ce produit", "error");
      return;
    }
    if (coupon.appliesToType === "variant_weight" && coupon.targetWeight !== item.weight) {
      showToast(lang === "ar" ? `هذا الكوبون مخصص لوزن ${coupon.targetWeight} فقط` : `Ce coupon est réservé au poids ${coupon.targetWeight}`, "error");
      return;
    }

    let discount = 0;
    const itemTotal = item.price * item.quantity;
    if (coupon.discountType === "percentage") {
      discount = Math.round((itemTotal * coupon.discountValue) / 100);
    } else {
      discount = Math.min(coupon.discountValue, itemTotal);
    }

    setAppliedCoupons((prev) => ({
      ...prev,
      [itemKey]: { coupon, discountAmount: discount }
    }));
    showToast(lang === "ar" ? "✓ تم تطبيق كود الخصم بنجاح!" : "✓ Coupon appliqué !", "success");
  };

  const handleRemoveCoupon = (itemKey: string) => {
    setAppliedCoupons((prev) => {
      const copy = { ...prev };
      delete copy[itemKey];
      return copy;
    });
    setCouponInputs((prev) => ({ ...prev, [itemKey]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const payload = {
      ...formData,
      discountAmount: totalDiscount,
      usedCoupons: Object.values(appliedCoupons).map((c: any) => c.coupon.code),
      items: items.map((item) => ({
        id: item.id,
        variantSku: item.variantSku,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const res = await createOrder(payload);

    if (res.success && res.orderNumber) {
      const orderNum = res.orderNumber;
      setSuccessOrderNum(orderNum);

      const targetPhone = (res as any).whatsappNumber || settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212602732533";

      // توليد رسالة الواتساب الشاملة لمسؤول المتجر
      const waUrl = getWhatsAppOrderUrl({
        orderNumber: orderNum,
        customerName: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city,
        address: formData.address,
        notes: formData.notes,
        items: items.map((i) => ({
          title: i.title[lang] || i.title.ar,
          quantity: i.quantity,
          price: i.price,
        })),
        total: total,
      }, targetPhone);
      setSuccessWaUrl(waUrl);

      // فتح محادثة الواتساب تلقائياً في نافذة جديدة
      if (typeof window !== "undefined") {
        try {
          window.open(waUrl, "_blank");
        } catch (e) {
          console.warn("Could not auto-open WhatsApp:", e);
        }
      }

      // تتبع أحداث فيسبوك بيكسل
      pixel.trackPurchase(total, "MAD", {
        order_id: orderNum,
        num_items: items.length,
      });
      pixel.trackLead(total, "MAD", { order_id: orderNum });

      clearCart();
    } else {
      if (res.errors) {
        const firstError = Object.values(res.errors)[0] as string[];
        setErrorMsg(firstError[0]);
      } else {
        setErrorMsg(res.message || "حدث خطأ غير متوقع");
      }
    }
    setLoading(false);
  };

  if (successOrderNum) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-2">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
          {lang === "ar" ? "شكرًا لثقتك بـ BioZad!" : "Merci pour votre confiance !"}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {lang === "ar" 
            ? "تم استلام وتسجيل طلبك بنجاح، وفتح محادثة الواتساب لتأكيد الشحن فوراً." 
            : "Votre commande a été reçue avec succès. Confirmez-la directement sur WhatsApp."}
        </p>
        <div className="bg-[#FAF9F6] dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-2xl">
          <span className="block text-xs text-neutral-400 uppercase tracking-widest">
            {lang === "ar" ? "رقم الطلب الخاص بك" : "Votre numéro de commande"}
          </span>
          <span className="text-2xl font-mono font-bold text-primary dark:text-accent mt-1 block">
            {successOrderNum}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          {successWaUrl && (
            <a
              href={successWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm shadow-xl shadow-[#25D366]/30 transition-all active:scale-95 animate-pulse"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{lang === "ar" ? "تأكيد طلبيتي فوراً عبر الواتساب 💬" : "Confirmer via WhatsApp 💬"}</span>
            </a>
          )}
          <a href="/" className="w-full sm:w-auto inline-block">
            <PremiumButton variant="outline" className="w-full">
              {lang === "ar" ? "العودة لتصفح المتجر" : "Retour au magasin"}
            </PremiumButton>
          </a>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <ShoppingBag className="h-12 w-12 mx-auto text-neutral-300" />
        <h3 className="text-lg font-medium">
          {lang === "ar" ? "سلة مشترياتك فارغة حالياً" : "Votre panier est vide."}
        </h3>
        <a href="/" className="inline-block">
          <PremiumButton variant="primary">
            {lang === "ar" ? "تصفح المنتجات" : "Découvrir nos soins"}
          </PremiumButton>
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* نموذج تعبئة البيانات */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
            {lang === "ar" ? "إتمام الطلب السريع (الدفع عند الاستلام)" : "Finaliser la commande (Paiement à la livraison)"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive text-sm rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <PremiumCard hoverEffect={false} className="p-6 space-y-4">
              
              {/* حقل الاسم */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {lang === "ar" ? "الاسم الكامل *" : "Nom complet *"}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={lang === "ar" ? "مثال: فاطمة الزهراء" : "Ex: Fatima-Zahra"}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* حقل الهاتف */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {lang === "ar" ? "رقم الهاتف (للتواصل وتأكيد الشحن) *" : "Téléphone (Pour confirmation) *"}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="06XXXXXXXX / 07XXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-start"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* حقل المدينة بالاختيار */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                    {lang === "ar" ? "المدينة *" : "Ville *"}
                  </label>
                  <select
                    required
                    value={selectedCity}
                    onChange={handleCitySelectChange}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">{lang === "ar" ? "-- اختر مدينتك --" : "-- Choisir la ville --"}</option>
                    {MOROCCAN_CITIES.map((city) => (
                      <option key={city.fr} value={city.ar}>
                        {lang === "ar" ? city.ar : city.fr}
                      </option>
                    ))}
                    <option value="other">{lang === "ar" ? "مدينة أخرى..." : "Autre ville..."}</option>
                  </select>

                  {selectedCity === "other" && (
                    <input
                      type="text"
                      required
                      value={customCity}
                      onChange={handleCustomCityChange}
                      placeholder={lang === "ar" ? "اكتب اسم مدينتك هنا..." : "Saisissez votre ville..."}
                      className="w-full mt-2 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 animate-fade-in"
                    />
                  )}
                </div>

                {/* حقل الشحن المجاني التنبيهي */}
                <div className="flex items-center gap-2 rounded-xl bg-[#FAF9F6] p-3 text-xs text-primary dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <Truck className="h-4 w-4 text-accent shrink-0" />
                  <span>
                    {activeSettings.isFreeShippingGlobally
                      ? (lang === "ar" ? "شحن مجاني لكافة المدن المغربية لفترة محدودة!" : "Livraison gratuite partout au Maroc !")
                      : lang === "ar"
                      ? `شحن مجاني لكافة المدن عند الشراء بـ ${activeSettings.freeShippingMin} درهم أو أكثر!`
                      : `Livraison gratuite partout au Maroc dès ${activeSettings.freeShippingMin} DH !`}
                  </span>
                </div>
              </div>

              {/* حقل العنوان بالتفصيل */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {lang === "ar" ? "العنوان السكني بالتفصيل *" : "Adresse résidentielle complète *"}
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={lang === "ar" ? "مثال: الحي الحسني، زنقة 4، رقم المنزل 12" : "Ex: Résidence Al-Yassmine, Appt 5, etc."}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* ملاحظات إضافية */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {lang === "ar" ? "ملاحظات وتوجيهات الشحن (اختياري)" : "Notes de livraison (Optionnel)"}
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={lang === "ar" ? "اترك لنا ملاحظاتك، مثل موعد التوصيل المفضل..." : "Précisez un horaire de livraison ou autre..."}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

            </PremiumCard>

            <PremiumButton 
              type="submit" 
              loading={loading} 
              variant="primary" 
              className="w-full py-4 text-base font-semibold shadow-premium-md"
            >
              {lang === "ar" ? "تأكيد طلب الشراء الآن" : "Confirmer ma commande"}
            </PremiumButton>
          </form>
        </div>

        {/* ملخص الطلب */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <PremiumCard hoverEffect={false} className="p-6 space-y-6">
            <h3 className="font-serif text-lg font-bold border-b border-neutral-100 dark:border-neutral-900 pb-3">
              {lang === "ar" ? "ملخص المنتجات" : "Résumé du panier"}
            </h3>

            {/* سطر قائمة المنتجات داخل الملخص */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-900 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => {
                const itemKey = item.id + (item.variantSku || "");
                return (
                  <div key={itemKey} className="py-4 space-y-3 border-b border-neutral-100 dark:border-neutral-900 last:border-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title[lang]}
                        className="h-12 w-12 rounded-lg object-cover bg-neutral-50"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate">
                          {item.title[lang]}
                        </h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {item.quantity} × {item.price} {lang === "ar" ? "د.م." : "DH"}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {item.price * item.quantity} {lang === "ar" ? "د.م." : "DH"}
                      </span>
                    </div>

                    {/* كوبون خصم خاص بكل منتج */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={lang === "ar" ? "كود خصم هذا المنتج..." : "Code coupon..."}
                          value={couponInputs[itemKey] || ""}
                          onChange={(e) => setCouponInputs({ ...couponInputs, [itemKey]: e.target.value.toUpperCase() })}
                          className="flex-1 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[10px] uppercase font-mono bg-white dark:bg-neutral-950"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(item)}
                          className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/95 transition-colors"
                        >
                          {lang === "ar" ? "تطبيق" : "Appliquer"}
                        </button>
                      </div>

                      {appliedCoupons[itemKey] && (
                        <div className="flex justify-between items-center text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                          <span>{lang === "ar" ? `✓ خصم بقيمة ${appliedCoupons[itemKey].discountAmount} د.م.` : `✓ Réduction de ${appliedCoupons[itemKey].discountAmount} DH`}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCoupon(itemKey)}
                            className="text-rose-500 hover:text-rose-700 font-bold"
                          >
                            {lang === "ar" ? "إلغاء" : "Annuler"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* جدول الحسابات والتكلفة الإجمالية */}
            <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-900 pt-4 text-xs font-medium">
              <div className="flex justify-between text-neutral-500">
                <span>{lang === "ar" ? "المجموع الفرعي" : "Sous-total"}</span>
                <span>{subtotal} {lang === "ar" ? "د.م." : "DH"}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{lang === "ar" ? "إجمالي الخصم" : "Réduction totale"}</span>
                  <span>-{totalDiscount} {lang === "ar" ? "د.م." : "DH"}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>{lang === "ar" ? "تكلفة التوصيل" : "Livraison"}</span>
                <span>
                  {shippingCost === 0 
                    ? (lang === "ar" ? "مجاني" : "Gratuite") 
                    : `${shippingCost} ${lang === "ar" ? "د.م." : "DH"}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white border-t border-neutral-100 dark:border-neutral-900 pt-3 mt-1">
                <span>{lang === "ar" ? "الإجمالي الكلي" : "Total à payer"}</span>
                <span className="text-primary dark:text-accent">
                  {total} {lang === "ar" ? "د.م." : "DH"}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 text-center">
              {lang === "ar" 
                ? "🔒 دفع آمن 100% نقداً عند الاستلام وفحص المنتج." 
                : "🔒 Paiement 100% sécurisé en espèces à la livraison."}
            </p>
          </PremiumCard>
        </div>

      </div>
    </div>
  );
}