"use client";

import React, { useState, useEffect } from "react";
import { 
  getAllBundles, 
  setFeaturedBundle, 
  toggleBundleActive, 
  saveFeaturedBundleSettings, 
  deleteBundle,
  getCustomBundleSettings,
  saveCustomBundleSettings,
  BundleItem,
  CustomBundleTier
} from "@/app/actions/featuredBundle";
import { uploadImageToCloudinary } from "@/app/actions/upload";
import { useToastStore } from "@/store/useToastStore";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  Sparkles, Plus, Star, Trash2, Edit3, Eye, EyeOff, Check, 
  Image as ImageIcon, Gift, Package, Sliders, CheckCircle2, 
  X, AlertCircle, ArrowUpDown, Percent, Layers, UploadCloud
} from "lucide-react";
import { MultiImageUploader } from "./MultiImageUploader";

interface BundleManagementProps {
  products: any[];
}

export function BundleManagement({ products }: BundleManagementProps) {
  const { showToast } = useToastStore();
  const [subTab, setSubTab] = useState<"presets" | "custom_builder">("presets");
  const [loading, setLoading] = useState(false);
  const [bundles, setBundles] = useState<any[]>([]);

  // حالة المودال لإضافة أو تعديل باقة جاهزة
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [form, setForm] = useState({
    titleAr: "",
    titleFr: "",
    descAr: "",
    descFr: "",
    price: "",
    compareAtPrice: "",
    image: "",
    images: [] as string[],
    isActive: true,
    isFeatured: false,
    hotTitleAr: "",
    hotTitleFr: "",
    hotSubAr: "",
    hotSubFr: "",
    hotImage: "",
    hotLink: "",
    items: [] as BundleItem[],
  });

  // حالة إعدادات "شكّل باقتك المخصصة"
  const [customLoading, setCustomLoading] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    isActive: true,
    minItems: 2,
    allowedProductIds: [] as string[],
    tiers: [
      { min_amount: 300, discount_percent: 10 },
      { min_amount: 500, discount_percent: 15 }
    ] as CustomBundleTier[],
    bannerTitleAr: "شكّل باقتك المخصصة",
    bannerTitleFr: "Composez Votre Pack Sur-Mesure",
    bannerSubtitleAr: "اختر منتجاتك المفضلة واستفد من تخفيض فوري متصاعد يصل إلى 15% وأكثر!",
    bannerSubtitleFr: "Choisissez vos produits préférés et profitez de réductions immédiates!",
  });
  const [whitelistSearch, setWhitelistSearch] = useState("");

  // تحميل البيانات
  const loadData = async () => {
    setLoading(true);
    try {
      const [bundlesRes, customRes] = await Promise.all([
        getAllBundles(),
        getCustomBundleSettings()
      ]);

      if (bundlesRes.success) {
        setBundles(bundlesRes.bundles);
      }
      if (customRes.success && customRes.settings) {
        const s = customRes.settings;
        setCustomSettings({
          isActive: s.isActive,
          minItems: s.minItems,
          allowedProductIds: s.allowedProductIds || [],
          tiers: s.tiers || [
            { min_amount: 300, discount_percent: 10 },
            { min_amount: 500, discount_percent: 15 }
          ],
          bannerTitleAr: s.bannerTitle?.ar || "شكّل باقتك المخصصة",
          bannerTitleFr: s.bannerTitle?.fr || "Composez Votre Pack Sur-Mesure",
          bannerSubtitleAr: s.bannerSubtitle?.ar || "اختر منتجاتك المفضلة واستفد من تخفيض فوري متصاعد يصل إلى 15% وأكثر!",
          bannerSubtitleFr: s.bannerSubtitle?.fr || "Choisissez vos produits préférés et profitez de réductions immédiates!",
        });
      }
    } catch (err: any) {
      showToast("حدث خطأ أثناء تحميل بيانات الباقات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // فتح فورم باقة جديدة
  const handleOpenNewBundle = () => {
    setEditingBundleId(null);
    setForm({
      titleAr: "",
      titleFr: "",
      descAr: "",
      descFr: "",
      price: "",
      compareAtPrice: "",
      image: "",
      images: [],
      isActive: true,
      isFeatured: bundles.length === 0,
      hotTitleAr: "",
      hotTitleFr: "",
      hotSubAr: "",
      hotSubFr: "",
      hotImage: "",
      hotLink: "",
      items: [],
    });
    setModalOpen(true);
  };

  // فتح فورم تعديل باقة
  const handleOpenEditBundle = (bundle: any) => {
    const bundleImages = Array.isArray(bundle.images) && bundle.images.length > 0
      ? bundle.images
      : (bundle.image ? [bundle.image] : []);

    setEditingBundleId(bundle.id);
    setForm({
      titleAr: bundle.title.ar,
      titleFr: bundle.title.fr,
      descAr: bundle.description.ar,
      descFr: bundle.description.fr,
      price: bundle.price.toString(),
      compareAtPrice: bundle.compareAtPrice ? bundle.compareAtPrice.toString() : "",
      image: bundle.image || bundleImages[0] || "",
      images: bundleImages,
      isActive: bundle.isActive,
      isFeatured: bundle.isFeatured,
      hotTitleAr: bundle.hotProductTitle?.ar || "",
      hotTitleFr: bundle.hotProductTitle?.fr || "",
      hotSubAr: bundle.hotProductSub?.ar || "",
      hotSubFr: bundle.hotProductSub?.fr || "",
      hotImage: bundle.hotProductImage || "",
      hotLink: bundle.hotProductLink || "",
      items: Array.isArray(bundle.items) ? [...bundle.items] : [],
    });
    setModalOpen(true);
  };

  // رفع الصور
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "hotImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadImageToCloudinary(fd);
    if (res.success && res.url) {
      setForm((prev) => ({ ...prev, [field]: res.url }));
      showToast("✓ تم رفع الصورة بنجاح!", "success");
    } else {
      showToast(res.message || "فشل رفع الصورة", "error");
    }
    setUploading(false);
  };

  // إضافة منتج لمكونات الباقة
  const handleToggleProductInBundle = (product: any) => {
    const exists = form.items.some((item) => item.productId === product._id || item.productId === product.id);
    const prodId = product._id || product.id;

    if (exists) {
      setForm((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.productId !== prodId),
      }));
    } else {
      const newItem: BundleItem = {
        productId: prodId,
        title: { ar: product.title.ar, fr: product.title.fr || product.title.ar },
        price: Number(product.price) || 0,
        image: (product.images && product.images[0]) || "",
        weight: (product.variants && product.variants[0]?.weight) || undefined,
        quantity: 1,
      };
      setForm((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
  };

  // تحديث كمية منتج في الباقة
  const handleItemQuantityChange = (productId: string, delta: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: nextQty };
          }
          return item;
        }),
    }));
  };

  // حساب المجموع الأصلي لمنتجات الباقة
  const calculatedItemsTotal = form.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // حفظ الباقة الجاهزة
  const handleSaveBundleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalImages = form.images.length > 0 ? form.images : (form.image ? [form.image] : []);

    const payload = {
      id: editingBundleId || undefined,
      title: { ar: form.titleAr, fr: form.titleFr },
      description: { ar: form.descAr, fr: form.descFr },
      price: form.price,
      compareAtPrice: form.compareAtPrice || (calculatedItemsTotal > 0 ? calculatedItemsTotal : undefined),
      image: finalImages[0] || form.image,
      images: finalImages,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      items: form.items,
      hotProductTitle: { ar: form.hotTitleAr, fr: form.hotTitleFr },
      hotProductSub: { ar: form.hotSubAr, fr: form.hotSubFr },
      hotProductImage: form.hotImage,
      hotProductLink: form.hotLink,
    };

    const res = await saveFeaturedBundleSettings(payload);
    if (res.success) {
      showToast(res.message, "success");
      setModalOpen(false);
      await loadData();
    } else {
      showToast(res.message || "حدث خطأ أثناء حفظ الباقة", "error");
    }
    setLoading(false);
  };

  // تعيين باقة كمعروضة بالرئيسية
  const handleSetFeatured = async (bundleId: string) => {
    setLoading(true);
    const res = await setFeaturedBundle(bundleId);
    if (res.success) {
      showToast(res.message, "success");
      await loadData();
    } else {
      showToast(res.message || "فشل تعيين الباقة", "error");
    }
    setLoading(false);
  };

  // تفعيل / تعطيل باقة
  const handleToggleActive = async (bundleId: string, currentStatus: boolean) => {
    const res = await toggleBundleActive(bundleId, !currentStatus);
    if (res.success) {
      showToast(res.message, "success");
      await loadData();
    } else {
      showToast(res.message || "فشل تحديث الحالة", "error");
    }
  };

  // حذف باقة
  const handleDelete = async (bundleId: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الباقة "${title}" نهائياً؟`)) return;
    setLoading(true);
    const res = await deleteBundle(bundleId);
    if (res.success) {
      showToast(res.message, "success");
      await loadData();
    } else {
      showToast(res.message || "فشل الحذف", "error");
    }
    setLoading(false);
  };

  // إضافة مستوى خصم للباقة المخصصة
  const handleAddTier = () => {
    setCustomSettings((prev) => ({
      ...prev,
      tiers: [...prev.tiers, { min_amount: 800, discount_percent: 20 }],
    }));
  };

  // تعديل مستوى خصم
  const handleTierChange = (index: number, field: "min_amount" | "discount_percent", value: number) => {
    const updated = [...customSettings.tiers];
    updated[index] = { ...updated[index], [field]: value };
    setCustomSettings((prev) => ({ ...prev, tiers: updated }));
  };

  // حذف مستوى خصم
  const handleRemoveTier = (index: number) => {
    if (customSettings.tiers.length <= 1) {
      showToast("يجب إبقاء مستوى خصم واحد على الأقل", "error");
      return;
    }
    setCustomSettings((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index),
    }));
  };

  // تبديل منتج في القائمة المسموحة للباقة المخصصة
  const handleToggleWhitelist = (productId: string) => {
    const exists = customSettings.allowedProductIds.includes(productId);
    setCustomSettings((prev) => ({
      ...prev,
      allowedProductIds: exists
        ? prev.allowedProductIds.filter((id) => id !== productId)
        : [...prev.allowedProductIds, productId],
    }));
  };

  // تحديد الكل أو إلغاء التحديد للقائمة المسموحة
  const handleSelectAllWhitelist = (selectAll: boolean) => {
    setCustomSettings((prev) => ({
      ...prev,
      allowedProductIds: selectAll ? products.map((p) => p._id || p.id) : [],
    }));
  };

  // حفظ إعدادات الباقة المخصصة
  const handleSaveCustomSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomLoading(true);

    const payload = {
      isActive: customSettings.isActive,
      minItems: customSettings.minItems,
      allowedProductIds: customSettings.allowedProductIds,
      tiers: customSettings.tiers.sort((a, b) => a.min_amount - b.min_amount),
      bannerTitle: { ar: customSettings.bannerTitleAr, fr: customSettings.bannerTitleFr },
      bannerSubtitle: { ar: customSettings.bannerSubtitleAr, fr: customSettings.bannerSubtitleFr },
    };

    const res = await saveCustomBundleSettings(payload);
    if (res.success) {
      showToast(res.message, "success");
      await loadData();
    } else {
      showToast(res.message || "حدث خطأ أثناء حفظ إعدادات الباقة المخصصة", "error");
    }
    setCustomLoading(false);
  };

  // فلترة المنتجات في البحث
  const filteredProductsForBundle = products.filter((p) =>
    p.title?.ar?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredWhitelistProducts = products.filter((p) =>
    p.title?.ar?.toLowerCase().includes(whitelistSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* التبويب العلوي الأنيق */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-serif font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            إدارة عروض وباقات المتجر (Bundles Hub)
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            تحكم شامل في الباقات الجاهزة المعروضة في الرئيسية، وفي نظام &quot;شكّل باقتك المخصصة بنفسك&quot;.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setSubTab("presets")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === "presets"
                ? "bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>الباقات الجاهزة ({bundles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("custom_builder")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === "custom_builder"
                ? "bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>شكّل باقتك المخصصة (BYOB)</span>
            {customSettings.isActive && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. تبويب الباقات الجاهزة (Preset Bundles) */}
      {/* ========================================================================= */}
      {subTab === "presets" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                قائمة باقات المتجر
              </h3>
              <p className="text-xs text-neutral-400">
                الباقة التي تحمل علامة النجمة ⭐ هي التي تظهر حالياً للزبائن في واجهة المتجر الرئيسية.
              </p>
            </div>

            <PremiumButton
              onClick={handleOpenNewBundle}
              variant="primary"
              className="px-5 py-2.5 text-xs font-bold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>إنشاء باقة جديدة</span>
            </PremiumButton>
          </div>

          {/* شبكة عرض كروت الباقات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => {
              const savings = bundle.compareAtPrice && bundle.compareAtPrice > bundle.price
                ? bundle.compareAtPrice - bundle.price
                : 0;
              const isMain = bundle.isFeatured;

              return (
                <div
                  key={bundle.id}
                  className={`relative rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white dark:bg-neutral-900 ${
                    isMain
                      ? "border-emerald-500 shadow-premium-md ring-2 ring-emerald-500/20"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  {/* شارات الحالة أعلى الكرت */}
                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between z-10">
                    {isMain ? (
                      <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>معروضة بالرئيسية</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetFeatured(bundle.id)}
                        className="bg-white/90 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1 backdrop-blur-sm transition-colors"
                        title="انقر لجعل هذه الباقة هي المعروضة بالصفحة الرئيسية"
                      >
                        <Star className="h-3 w-3" />
                        <span>تعيين كمعروضة</span>
                      </button>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        bundle.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {bundle.isActive ? "نشطة" : "مخفية"}
                    </span>
                  </div>

                  {/* صورة الباقة */}
                  <div className="relative aspect-[16/10] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <img
                      src={bundle.image || (bundle.images && bundle.images[0])}
                      alt={bundle.title.ar}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {Array.isArray(bundle.images) && bundle.images.length > 1 && (
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        <span>{bundle.images.length} صور</span>
                      </span>
                    )}
                  </div>

                  {/* تفاصيل الباقة */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="font-serif font-black text-base text-neutral-900 dark:text-white line-clamp-1">
                        {bundle.title.ar}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1 font-mono">
                        {bundle.title.fr}
                      </p>

                      {/* السعر والتوفير */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                          {bundle.price} د.م.
                        </span>
                        {bundle.compareAtPrice && bundle.compareAtPrice > bundle.price && (
                          <span className="text-xs text-neutral-400 line-through font-mono">
                            {bundle.compareAtPrice} د.م.
                          </span>
                        )}
                        {savings > 0 && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
                            توفير {savings} د.م.
                          </span>
                        )}
                      </div>

                      {/* المنتجات المضمنة بالباقة */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                          المنتجات المكونة ({bundle.items?.length || 0}):
                        </span>
                        {bundle.items && bundle.items.length > 0 ? (
                          <div className="flex items-center -space-x-2 rtl:space-x-reverse overflow-hidden py-1">
                            {bundle.items.slice(0, 5).map((it: any, idx: number) => (
                              <img
                                key={idx}
                                src={it.image || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=100"}
                                alt={it.title?.ar || ""}
                                title={`${it.title?.ar} (×${it.quantity})`}
                                className="h-8 w-8 rounded-full border-2 border-white dark:border-neutral-900 object-cover shadow-xs"
                              />
                            ))}
                            {bundle.items.length > 5 && (
                              <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold flex items-center justify-center text-neutral-600 border-2 border-white dark:border-neutral-900">
                                +{bundle.items.length - 5}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-neutral-400 italic">
                            نص تفاصيل يدوي (لا توجد منتجات محددة)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* أزرار التحكم بالباقة */}
                    <div className="flex items-center justify-between gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleActive(bundle.id, bundle.isActive)}
                          className={`p-2 rounded-xl text-xs transition-colors border ${
                            bundle.isActive
                              ? "text-neutral-500 hover:text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={bundle.isActive ? "إخفاء الباقة" : "تفعيل الباقة"}
                        >
                          {bundle.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>

                        <button
                          onClick={() => handleOpenEditBundle(bundle)}
                          className="p-2 rounded-xl text-xs text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 border transition-colors"
                          title="تعديل تفاصيل الباقة"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(bundle.id, bundle.title.ar)}
                          className="p-2 rounded-xl text-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border transition-colors"
                          title="حذف الباقة"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {!isMain && (
                        <button
                          onClick={() => handleSetFeatured(bundle.id)}
                          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Star className="h-3.5 w-3.5" />
                          <span>عرض الآن بالرئيسية</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {bundles.length === 0 && (
              <div className="col-span-full py-16 text-center border-2 border-dashed rounded-3xl p-8 space-y-3">
                <Package className="h-10 w-10 text-neutral-300 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-600">لا توجد باقات جاهزة حالياً</h4>
                <p className="text-xs text-neutral-400">انقر على &quot;إنشاء باقة جديدة&quot; لبدء إضافة باقات ترويجية مميزة.</p>
                <PremiumButton onClick={handleOpenNewBundle} variant="primary" className="text-xs px-6 py-2 mt-2">
                  + إنشاء أول باقة
                </PremiumButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. تبويب "شكّل باقتك المخصصة" (Build Your Own Bundle Settings) */}
      {/* ========================================================================= */}
      {subTab === "custom_builder" && (
        <form onSubmit={handleSaveCustomSettings} className="space-y-8">
          
          {/* بطاقة التفعيل والحد الأدنى */}
          <PremiumCard hoverEffect={false} className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-emerald-600" />
                  إعدادات تجربة &quot;شكّل باقتك بنفسك&quot; (Build Your Own Bundle)
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  تتيح للزبون الدخول لصفحة خاصة لاختيار منتجاته المفضلة مع تطبيق تخفيض فوري متصاعد كلما اشترى أكثر.
                </p>
              </div>

              {/* مفتاح التفعيل الرئيسي */}
              <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-2xl border">
                <input
                  type="checkbox"
                  id="customActive"
                  checked={customSettings.isActive}
                  onChange={(e) => setCustomSettings({ ...customSettings, isActive: e.target.checked })}
                  className="h-5 w-5 accent-emerald-600 cursor-pointer"
                />
                <label htmlFor="customActive" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer select-none">
                  {customSettings.isActive ? "✓ الميزة مفعلة وظاهرة للزبائن" : "✕ الميزة معطلة حالياً"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  الحد الأدنى لعدد المنتجات لتأكيد الباقة *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={customSettings.minItems}
                  onChange={(e) => setCustomSettings({ ...customSettings, minItems: Number(e.target.value) })}
                  className="w-full border rounded-xl p-3 font-mono text-sm"
                  placeholder="مثال: 2"
                />
                <p className="text-[11px] text-neutral-400">
                  لن يتمكن الزبون من إضافة الباقة إلى السلة إلا إذا اختار هذا العدد على الأقل.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  عنوان الصفحة التسويقي بالعربية
                </label>
                <input
                  type="text"
                  required
                  value={customSettings.bannerTitleAr}
                  onChange={(e) => setCustomSettings({ ...customSettings, bannerTitleAr: e.target.value })}
                  className="w-full border rounded-xl p-3 text-sm"
                  placeholder="مثال: شكّل باقتك المخصصة"
                />
              </div>
            </div>
          </PremiumCard>

          {/* بطاقة مستويات الخصم التدريجي (Tiered Discounts) */}
          <PremiumCard hoverEffect={false} className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Percent className="h-4 w-4 text-emerald-600" />
                  مستويات التخفيض التدريجي حسب مجموع المبلغ (بالدرهم)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  حدد المبالغ ونسب التخفيض التي سيحصل عليها الزبون تلقائياً كلما زادت قيمة باقته.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة مستوى خصم</span>
              </button>
            </div>

            <div className="space-y-3">
              {customSettings.tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800"
                >
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 shrink-0">
                    المستوى {idx + 1}
                  </span>

                  <div className="flex-1 flex items-center gap-3 w-full">
                    <span className="text-xs font-semibold text-neutral-600 shrink-0">إذا بلغ المجموع ≥</span>
                    <input
                      type="number"
                      min="50"
                      step="10"
                      required
                      value={tier.min_amount}
                      onChange={(e) => handleTierChange(idx, "min_amount", Number(e.target.value))}
                      className="w-full sm:w-36 border rounded-xl p-2 font-mono text-sm bg-white dark:bg-neutral-900"
                      placeholder="300"
                    />
                    <span className="text-xs text-neutral-400 font-mono">درهم</span>
                  </div>

                  <div className="flex-1 flex items-center gap-3 w-full">
                    <span className="text-xs font-semibold text-neutral-600 shrink-0">يحصل على خصم فوري:</span>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      required
                      value={tier.discount_percent}
                      onChange={(e) => handleTierChange(idx, "discount_percent", Number(e.target.value))}
                      className="w-full sm:w-28 border rounded-xl p-2 font-mono text-sm bg-white dark:bg-neutral-900 text-emerald-700 font-bold"
                      placeholder="10"
                    />
                    <span className="text-xs text-neutral-400 font-mono">%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors self-end sm:self-center"
                    title="حذف هذا المستوى"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* بطاقة اختيار المنتجات المسموح للزبون بالاختيار منها (Whitelist) */}
          <PremiumCard hoverEffect={false} className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  تحديد المنتجات المتاحة للزبون في صفحة التشكيل ({customSettings.allowedProductIds.length} محددة)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  فقط المنتجات المعلمة بعلامة صح هي التي ستظهر للزبون ليختار منها في باقته المخصصة.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllWhitelist(true)}
                  className="text-xs font-bold text-neutral-600 hover:text-emerald-700 px-3 py-1.5 rounded-xl border hover:bg-neutral-50"
                >
                  تحديد الكل
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAllWhitelist(false)}
                  className="text-xs font-bold text-neutral-400 hover:text-rose-600 px-3 py-1.5 rounded-xl border hover:bg-neutral-50"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>

            {/* شريط البحث */}
            <input
              type="text"
              value={whitelistSearch}
              onChange={(e) => setWhitelistSearch(e.target.value)}
              placeholder="ابحث عن منتج لتحديده في الباقة..."
              className="w-full border rounded-xl p-3 text-xs"
            />

            {/* شبكة المنتجات مع Checkbox */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
              {filteredWhitelistProducts.map((p) => {
                const prodId = p._id || p.id;
                const isSelected = customSettings.allowedProductIds.includes(prodId);

                return (
                  <div
                    key={prodId}
                    onClick={() => handleToggleWhitelist(prodId)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent onClick
                      className="h-4 w-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                    />
                    <img
                      src={(p.images && p.images[0]) || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=100"}
                      alt={p.title.ar}
                      className="h-10 w-10 rounded-xl object-cover border shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                        {p.title.ar}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {p.price} د.م.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>

          {/* زر حفظ إعدادات الباقة المخصصة */}
          <div className="flex justify-end pt-2">
            <PremiumButton
              type="submit"
              loading={customLoading}
              variant="primary"
              className="px-10 py-3.5 text-xs font-bold"
            >
              حفظ وتطبيق إعدادات &quot;شكّل باقتك المخصصة&quot;
            </PremiumButton>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. مودال إضافة / تعديل باقة جاهزة (Bundle Create / Edit Modal) */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* رأس المودال */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-serif font-black text-neutral-900 dark:text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-emerald-600" />
                  {editingBundleId ? "تعديل بيانات الباقة" : "إنشاء باقة ترويجية جديدة"}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  حدد محتويات الباقة، الأسعار، وصورة العرض الترويجي.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBundleSubmit} className="space-y-6 text-xs font-semibold">
              
              {/* العناوين */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-600 dark:text-neutral-300">عنوان الباقة بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={form.titleAr}
                    onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                    className="w-full border rounded-xl p-3"
                    placeholder="مثال: باقة السعادة الشاملة (عرض خاص)"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-neutral-600 dark:text-neutral-300">عنوان الباقة بالفرنسية *</label>
                  <input
                    type="text"
                    required
                    value={form.titleFr}
                    onChange={(e) => setForm({ ...form, titleFr: e.target.value })}
                    className="w-full border rounded-xl p-3"
                    placeholder="Ex: Pack Bonheur BioZad (Offre Spéciale)"
                  />
                </div>
              </div>

              {/* الأسعار */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-600 dark:text-neutral-300">سعر البيع المخفض (درهم) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border rounded-xl p-3 font-mono"
                    placeholder="مثال: 450"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-600 dark:text-neutral-300">
                    السعر الأصلي قبل الخصم (درهم)
                    {calculatedItemsTotal > 0 && (
                      <span className="text-[10px] text-emerald-600 mr-1 font-mono">
                        (مجموع المنتجات: {calculatedItemsTotal} د.م.)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                    className="w-full border rounded-xl p-3 font-mono"
                    placeholder={calculatedItemsTotal > 0 ? calculatedItemsTotal.toString() : "مثال: 550"}
                  />
                </div>
              </div>

              {/* معرض صور الباقة الترويجية */}
              <div className="border rounded-2xl p-4 bg-neutral-50/60 dark:bg-neutral-800/30">
                <MultiImageUploader
                  images={form.images}
                  onChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs, image: imgs[0] || "" }))}
                  label="معرض صور الباقة"
                  description="يمكنك رفع عدة صور للباقة أو لصق روابطها. الصورة الأولى تحمل علامة ⭐ وهي الصورة الرئيسية."
                  maxImages={8}
                />
              </div>

              {/* ======================================================= */}
              {/* منتقي المنتجات الحقيقية المضمنة بالباقة */}
              {/* ======================================================= */}
              <div className="border rounded-2xl p-4 bg-neutral-50/60 dark:bg-neutral-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-emerald-600" />
                      المنتجات المكونة للباقة ({form.items.length} منتجات مضافة)
                    </h4>
                    <p className="text-[10px] text-neutral-400">
                      اختر المنتجات الفعلية من المتجر التي يحصل عليها الزبون عند شراء هذه الباقة.
                    </p>
                  </div>

                  {calculatedItemsTotal > 0 && (
                    <span className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 px-3 py-1 rounded-xl border">
                      إجمالي القيمة: {calculatedItemsTotal} د.م.
                    </span>
                  )}
                </div>

                {/* قائمة المنتجات المضافة حالياً في الباقة */}
                {form.items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {form.items.map((it) => (
                      <div
                        key={it.productId}
                        className="flex items-center justify-between p-2.5 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xs"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img
                            src={it.image || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=800"}
                            alt={it.title.ar}
                            className="h-8 w-8 rounded-lg object-cover border shrink-0"
                          />
                          <div className="overflow-hidden">
                            <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 truncate">
                              {it.title.ar}
                            </p>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {it.price} د.م. {it.weight ? `• ${it.weight}` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-900">
                            <button
                              type="button"
                              onClick={() => handleItemQuantityChange(it.productId, -1)}
                              className="px-2 py-0.5 text-xs text-neutral-500 hover:bg-neutral-200"
                            >
                              -
                            </button>
                            <span className="px-2 text-[11px] font-bold font-mono">{it.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleItemQuantityChange(it.productId, 1)}
                              className="px-2 py-0.5 text-xs text-neutral-500 hover:bg-neutral-200"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleProductInBundle({ id: it.productId, _id: it.productId })}
                            className="p-1 text-neutral-400 hover:text-rose-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* منتقي المنتجات مع محرك بحث */}
                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="ابحث عن منتج لإضافته للباقة..."
                    className="w-full border rounded-xl p-2.5 text-xs bg-white dark:bg-neutral-900"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {filteredProductsForBundle.map((p) => {
                      const prodId = p._id || p.id;
                      const isSelected = form.items.some((it) => it.productId === prodId);

                      return (
                        <div
                          key={prodId}
                          onClick={() => handleToggleProductInBundle(p)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] cursor-pointer transition-all ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 font-bold"
                              : "border-neutral-200 bg-white dark:bg-neutral-800 hover:border-neutral-300"
                          }`}
                        >
                          <img
                            src={(p.images && p.images[0]) || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=800"}
                            alt={p.title.ar}
                            className="h-7 w-7 rounded-lg object-cover shrink-0"
                          />
                          <span className="truncate flex-1">{p.title.ar}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* الوصف والمحتويات النصية */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-600 dark:text-neutral-300">
                    وصف أو محتويات الباقة بالعربية * (يظهر للزبون)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.descAr}
                    onChange={(e) => setForm({ ...form, descAr: e.target.value })}
                    className="w-full border rounded-xl p-3 leading-relaxed"
                    placeholder="تشكيلة منسقة بعناية من أفضل ما يجود به terroir المغربي..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-neutral-600 dark:text-neutral-300">
                    وصف أو محتويات الباقة بالفرنسية *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.descFr}
                    onChange={(e) => setForm({ ...form, descFr: e.target.value })}
                    className="w-full border rounded-xl p-3 leading-relaxed"
                    placeholder="Une sélection haut de gamme pour le bien-être..."
                  />
                </div>
              </div>

              {/* خيارات الحالة والتمييز */}
              <div className="flex flex-wrap items-center gap-6 border-t pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    ⭐ تعيين هذه الباقة كـ &quot;المعروضة بالصفحة الرئيسية&quot; فوراً
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    تفعيل ونشر الباقة
                  </span>
                </label>
              </div>

              {/* إعدادات الكارت العائم (Hero Card) */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  إعدادات الكارت العائم الترويجي (الـ Hero)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-500">عنوان المنتج بالعربية</label>
                    <input
                      type="text"
                      value={form.hotTitleAr}
                      onChange={(e) => setForm({ ...form, hotTitleAr: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs"
                      placeholder="مثال: زيت التين الشوكي النقي"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-500">عنوان الشارة بالعربية</label>
                    <input
                      type="text"
                      value={form.hotSubAr}
                      onChange={(e) => setForm({ ...form, hotSubAr: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs"
                      placeholder="مثال: 🔥 الأكثر طلباً هذا الأسبوع"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                      صورة مصغرة للمنتج العائم
                    </label>
                    {form.hotImage ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-2xl border bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs">
                        <img
                          src={form.hotImage}
                          alt="مصغرة الكارت العائم"
                          className="h-12 w-12 rounded-xl object-cover border shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">✓ تم تعيين الصورة</p>
                          <p className="text-[10px] text-neutral-400 truncate font-mono mt-0.5">{form.hotImage}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="cursor-pointer px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 rounded-xl text-[11px] font-bold text-neutral-700 dark:text-neutral-300 transition-colors">
                            {uploading ? "..." : "تغيير"}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploading}
                              onChange={(e) => handleUpload(e, "hotImage")}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, hotImage: "" }))}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                            title="حذف الصورة"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-2xl p-3 cursor-pointer bg-white dark:bg-neutral-900 hover:bg-emerald-50/20 transition-all text-center">
                        <UploadCloud className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          {uploading ? "جاري رفع الصورة..." : "رفع صورة مصغرة للكارت 📁"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploading}
                          onChange={(e) => handleUpload(e, "hotImage")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-500">رابط التوجيه (Link)</label>
                    <input
                      type="text"
                      value={form.hotLink}
                      onChange={(e) => setForm({ ...form, hotLink: e.target.value })}
                      className="w-full border rounded-xl p-2.5 text-xs font-mono"
                      placeholder="/shop أو رابط صفحة المنتج"
                    />
                  </div>
                </div>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border text-neutral-600 hover:bg-neutral-50 text-xs font-bold"
                >
                  إلغاء
                </button>
                <PremiumButton
                  type="submit"
                  loading={loading}
                  variant="primary"
                  className="px-8 py-2.5 text-xs font-bold"
                >
                  {editingBundleId ? "حفظ التعديلات" : "نشر الباقة الجديدة"}
                </PremiumButton>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
