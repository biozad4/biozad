"use client";

import React, { useState, useEffect } from "react";
import {
  getLandingPages,
  saveLandingPage,
  deleteLandingPage,
  toggleLandingPageStatus,
  seedSampleLandingPage,
} from "@/app/actions/landing";
import { PremiumCard } from "../ui/premium-card";
import { PremiumButton } from "../ui/premium-button";
import { useToastStore } from "@/store/useToastStore";
import { MultiImageUploader } from "./MultiImageUploader";
import {
  LayoutGrid,
  Eye,
  Plus,
  Save,
  Trash2,
  Settings,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  Gift,
  HelpCircle,
  MessageSquare,
  DollarSign,
  Layers,
  ArrowRight,
  RefreshCw,
  Copy,
} from "lucide-react";

interface LandingPageBuilderProps {
  products: any[];
}

export function LandingPageBuilder({ products }: LandingPageBuilderProps) {
  const { showToast } = useToastStore();

  const [pagesList, setPagesList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "edit" | "preview">("list");

  // بيانات الصفحة الجاري تعديلها
  const [formData, setFormData] = useState<any>({
    id: undefined,
    _id: undefined,
    slug: "",
    title: "",
    isActive: true,
    hero: {
      productId: "",
      productTitle: "",
      title: { ar: "", fr: "" },
      subtitle: { ar: "", fr: "" },
      badge: "🔥 العرض الأقوى هذا الأسبوع • خصم يصل إلى 40% + شحن مجاني",
      images: [],
      videoUrl: "",
      price: 180,
      originalPrice: 250,
      stockLeft: 7,
      facebookPixelId: "",
      offers: [
        {
          id: "offer-1",
          title: "عبوة واحدة (تجربة)",
          quantity: 1,
          price: 180,
          compareAtPrice: 250,
          freeShipping: false,
          badge: "سعر عادي",
          isPopular: false,
        },
        {
          id: "offer-2",
          title: "عبوتان (الأكثر طلباً ⭐)",
          quantity: 2,
          price: 299,
          compareAtPrice: 500,
          freeShipping: true,
          badge: "وفر 90 د.م + توصيل مجاني",
          isPopular: true,
        },
        {
          id: "offer-3",
          title: "3 عبوات (باقة التوفير العائلية)",
          quantity: 3,
          price: 399,
          compareAtPrice: 750,
          freeShipping: true,
          badge: "توصيل مجاني + هدية خاصة",
          isPopular: false,
        },
      ],
      features: [
        { title: "طبيعي وأصلي 100%", text: "معصور على البارد بدون أي إضافات كيميائية أو مواد حافظة." },
        { title: "توصيل سريع لباب منزلك", text: "شحن فوري خلال 24 إلى 48 ساعة لكافة المدن المغربية." },
        { title: "الدفع بعد المعاينة", text: "افتح طردك وتأكد من جودة المنتج بنفسك قبل دفع أي درهم." },
        { title: "ضمان الرضا الذهبي", text: "إن لم تكن راضياً عن الجودة نضمن لك استرجاع أو استبدال فوري." },
      ],
      reviews: [
        { name: "سارة التازي", city: "الرباط", rating: 5, comment: "صراحة جودة ولا أروع، الرائحة خفيفة والامتصاص سريع للبشرة، عجبني بزااف.", date: "منذ 3 أيام", verified: true },
        { name: "محمد العلمي", city: "الدار البيضاء", rating: 5, comment: "التوصيل كان سريع جداً، والسلعة أصلية ومطابقة للوصف. شكراً BioZad.", date: "منذ 5 أيام", verified: true },
      ],
      faq: [
        { question: "كيفاش غادي نتوصل بالطلب ديالي؟", answer: "بمجرد إدخال معلوماتك، كيتصل بيك فريق خدمة العملاء باش يأكد معاك العنوان، ومن بعد كيرسلوا ليك الطرد مع شركة التوصيل." },
        { question: "واش نقدر نفتح الكولية عاد نخلص؟", answer: "نعم بالتأكيد! يمكنك فتح الطرد والتأكد من سلامة وجودة المنتج عاد تخلص الموزع بكل أمان وثقة." },
      ],
    },
    seo: {
      title: "",
      description: "",
    },
  });

  const loadPages = async () => {
    setLoadingList(true);
    const res = await getLandingPages();
    if (res.success) {
      setPagesList(res.pages || []);
    }
    setLoadingList(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

  // اختيار منتج والملء التلقائي للبيانات
  const handleSelectProduct = (productId: string) => {
    const selectedProd = products.find((p) => p._id === productId || p.id === productId);
    if (!selectedProd) return;

    const basePrice = selectedProd.price || 180;
    const comparePrice = selectedProd.compareAtPrice || basePrice + 70;
    const prodImgs = Array.isArray(selectedProd.images) && selectedProd.images.length > 0 ? selectedProd.images : [];
    const prodSlug = (selectedProd.slug || selectedProd.title.ar).toLowerCase().replace(/[^a-z0-9_-]/g, "-");

    setFormData((prev: any) => ({
      ...prev,
      slug: prev.slug || `lp-${prodSlug}`,
      title: prev.title || `حملة إعلانية: ${selectedProd.title.ar}`,
      hero: {
        ...prev.hero,
        productId: selectedProd._id || selectedProd.id,
        productTitle: selectedProd.title.ar,
        title: {
          ar: prev.hero.title?.ar || selectedProd.title.ar,
          fr: prev.hero.title?.fr || selectedProd.title.fr,
        },
        subtitle: {
          ar: prev.hero.subtitle?.ar || selectedProd.description?.ar || "",
          fr: prev.hero.subtitle?.fr || selectedProd.description?.fr || "",
        },
        images: prodImgs.length > 0 ? prodImgs : prev.hero.images,
        price: basePrice,
        originalPrice: comparePrice,
        offers: [
          {
            id: "offer-1",
            title: "عبوة واحدة (تجربة)",
            quantity: 1,
            price: basePrice,
            compareAtPrice: comparePrice,
            freeShipping: false,
            badge: "سعر عادي",
            isPopular: false,
          },
          {
            id: "offer-2",
            title: "عبوتان (العرض الأكثر طلباً ⭐)",
            quantity: 2,
            price: Math.round(basePrice * 1.7),
            compareAtPrice: comparePrice * 2,
            freeShipping: true,
            badge: "وفر 90 د.م + توصيل مجاني",
            isPopular: true,
          },
          {
            id: "offer-3",
            title: "3 عبوات (باقة التوفير العائلية)",
            quantity: 3,
            price: Math.round(basePrice * 2.3),
            compareAtPrice: comparePrice * 3,
            freeShipping: true,
            badge: "توصيل مجاني + هدية خاصة",
            isPopular: false,
          },
        ],
      },
      seo: {
        title: `${selectedProd.title.ar} | عرض حصري وتوصيل مجاني BioZad`,
        description: selectedProd.description?.ar || "",
      },
    }));

    showToast("✓ تم ملء بيانات صفحة الهبوط تلقائياً من المنتج المحدد!", "success");
  };

  const handleCreateNew = () => {
    setFormData({
      id: undefined,
      _id: undefined,
      slug: "",
      title: "صفحة هبوط جديدة",
      isActive: true,
      hero: {
        productId: products[0]?._id || products[0]?.id || "",
        productTitle: products[0]?.title?.ar || "",
        title: { ar: "", fr: "" },
        subtitle: { ar: "", fr: "" },
        badge: "🔥 العرض الأقوى هذا الأسبوع • خصم يصل إلى 40% + شحن مجاني",
        images: products[0]?.images || [],
        videoUrl: "",
        price: products[0]?.price || 180,
        originalPrice: (products[0]?.price || 180) + 70,
        stockLeft: 7,
        facebookPixelId: "",
        offers: [
          {
            id: "offer-1",
            title: "عبوة واحدة (تجربة)",
            quantity: 1,
            price: products[0]?.price || 180,
            compareAtPrice: (products[0]?.price || 180) + 70,
            freeShipping: false,
            badge: "سعر عادي",
            isPopular: false,
          },
          {
            id: "offer-2",
            title: "عبوتان (الأكثر طلباً ⭐)",
            quantity: 2,
            price: Math.round((products[0]?.price || 180) * 1.7),
            compareAtPrice: ((products[0]?.price || 180) + 70) * 2,
            freeShipping: true,
            badge: "وفر 90 د.م + توصيل مجاني",
            isPopular: true,
          },
          {
            id: "offer-3",
            title: "3 عبوات (باقة التوفير العائلية)",
            quantity: 3,
            price: Math.round((products[0]?.price || 180) * 2.3),
            compareAtPrice: ((products[0]?.price || 180) + 70) * 3,
            freeShipping: true,
            badge: "توصيل مجاني + هدية خاصة",
            isPopular: false,
          },
        ],
        features: [
          { title: "طبيعي وأصلي 100%", text: "معصور على البارد بدون أي إضافات كيميائية أو مواد حافظة." },
          { title: "توصيل سريع لباب منزلك", text: "شحن فوري خلال 24 إلى 48 ساعة لكافة المدن المغربية." },
          { title: "الدفع بعد المعاينة", text: "افتح طردك وتأكد من جودة المنتج بنفسك قبل دفع أي درهم." },
        ],
        reviews: [
          { name: "سارة التازي", city: "الرباط", rating: 5, comment: "صراحة جودة ولا أروع، شكراً BioZad على المصداقية.", date: "منذ يومين", verified: true },
        ],
        faq: [
          { question: "كيفاش غادي نتوصل بالطلب ديالي؟", answer: "كيتصل بيك موظفونا لتأكيد العنوان وشحن طردك فورا." },
          { question: "واش كاين ضمان الرضا؟", answer: "نعم، إذا لم تكن راضياً يمكنك استبدال أو استرجاع المنتج." },
        ],
      },
      seo: { title: "", description: "" },
    });

    if (products.length > 0) {
      handleSelectProduct(products[0]._id || products[0].id);
    }
    setActiveTab("edit");
  };

  const handleEditPage = (page: any) => {
    setFormData(page);
    setActiveTab("edit");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف صفحة الهبوط هذه؟")) return;
    const res = await deleteLandingPage(id);
    if (res.success) {
      showToast(res.message, "success");
      loadPages();
      if (activeTab === "edit" && formData.id === id) {
        setActiveTab("list");
      }
    } else {
      showToast(res.message || "حدث خطأ أثناء الحذف", "error");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const res = await toggleLandingPageStatus(id, !currentStatus);
    if (res.success) {
      showToast(res.message, "success");
      loadPages();
    } else {
      showToast(res.message || "فشل تغيير الحالة", "error");
    }
  };

  const handleCreateSample = async () => {
    setSaving(true);
    const res = await seedSampleLandingPage();
    if (res.success) {
      showToast("✓ تم إنشاء صفحة هبوط نموذجية احترافية بنجاح!", "success");
      await loadPages();
      if ((res as any).page) {
        setFormData((res as any).page);
        setActiveTab("edit");
      }
    } else {
      showToast(res.message || "فشل إنشاء النموذج", "error");
    }
    setSaving(false);
  };

  const handleSave = async () => {
    if (!formData.slug?.trim()) {
      showToast("⚠️ يرجى تحديد الرابط المخصص (Slug) للصفحة", "error");
      return;
    }
    if (!formData.hero?.title?.ar?.trim()) {
      showToast("⚠️ يرجى إدخال عنوان جذاب باللغة العربية", "error");
      return;
    }

    setSaving(true);
    const res = await saveLandingPage(formData);
    if (res.success) {
      showToast(res.message, "success");
      await loadPages();
      if ((res as any).page) {
        setFormData((res as any).page);
      }
      setActiveTab("list");
    } else {
      showToast(res.message || "حدث خطأ أثناء الحفظ", "error");
    }
    setSaving(false);
  };

  // تعديل عروض الباقات
  const updateOffer = (index: number, field: string, value: any) => {
    const updatedOffers = [...formData.hero.offers];
    updatedOffers[index] = { ...updatedOffers[index], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, offers: updatedOffers },
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. الشريط العلوي للتحكم والتبديل */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary dark:text-accent font-black">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-black text-neutral-900 dark:text-white">
                منشئ ومحرر صفحات الهبوط الإعلانية (Ads Landing Pages)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                تجهيز صفحات بيع مباشرة مخصصة لحملات TikTok و Facebook Ads مع استمارة COD بنقرة واحدة وربط البيكسل.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              activeTab === "list" ? "bg-primary text-white border-primary" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            صفحات الهبوط ({pagesList.length})
          </button>

          {activeTab === "edit" && (
            <button
              onClick={() => setActiveTab("edit")}
              className="px-4 py-2 text-xs font-bold rounded-xl border bg-primary text-white border-primary transition-all"
            >
              محرر الصفحة
            </button>
          )}

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء صفحة جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. تبويب قائمة الصفحات (List View) */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {pagesList.length === 0 && !loadingList ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 text-primary dark:text-accent flex items-center justify-center">
                <Flame className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold">لا توجد صفحات هبوط منشأة حتى الآن</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                صفحات الهبوط ترفع نسبة مبيعات إعلانات TikTok و Facebook Ads بنسبة تفوق 3 أضعاف عبر تقديم عروض حصرية واستمارة طلب فورية بدون تشتيت الزبون.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <PremiumButton onClick={handleCreateSample} loading={saving} variant="primary" className="text-xs">
                  <Sparkles className="h-4 w-4 ml-1.5" />
                  <span>توليد صفحة هبوط نموذجية لزيت الأركان تلقائياً</span>
                </PremiumButton>
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-3 rounded-xl border text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  إنشاء صفحة فارغة من الصفر
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagesList.map((p) => {
                const firstImg = p.hero?.images?.[0] || "https://images.unsplash.com/photo-1608248597359-bb5c68f2f254?w=500";
                const offersCount = p.hero?.offers?.length || 0;
                return (
                  <PremiumCard key={p.id} hoverEffect={false} className="p-5 space-y-4 relative flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border">
                          <img src={firstImg} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                p.isActive ? "bg-emerald-500" : "bg-neutral-400"
                              }`}
                            />
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              {p.isActive ? "نشطة ومستعدة للإعلانات" : "معطلة"}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">{p.title}</h3>
                          <a
                            href={`/lp/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-primary dark:text-accent hover:underline"
                          >
                            <span>/lp/{p.slug}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">المنتج المرتبط:</span>
                          <strong className="text-neutral-800 dark:text-neutral-200">{p.hero?.productTitle || "عام"}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">باقات الأسعار:</span>
                          <strong className="text-neutral-800 dark:text-neutral-200">{offersCount} عروض متاحة</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Facebook Pixel:</span>
                          <strong className="text-neutral-800 dark:text-neutral-200 font-mono text-[10px]">
                            {p.hero?.facebookPixelId ? "مخصص ✓" : "العام"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPage(p)}
                          className="px-3 py-1.5 rounded-lg border text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          تعديل
                        </button>
                        <a
                          href={`/lp/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary dark:text-accent text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1"
                        >
                          <span>معاينة</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActive(p.id, p.isActive)}
                          title={p.isActive ? "تعطيل الصفحة" : "تفعيل الصفحة"}
                          className={`p-1.5 rounded-lg border text-xs ${
                            p.isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="حذف الصفحة"
                          className="p-1.5 rounded-lg border text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </PremiumCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. تبويب محرر صفحة الهبوط (Edit Mode) */}
      {activeTab === "edit" && (
        <div className="space-y-6">
          
          {/* شريط الإجراءات السريع للحفظ */}
          <div className="flex justify-between items-center bg-white dark:bg-neutral-900 border p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("list")}
                className="text-xs text-neutral-500 hover:text-neutral-900 font-bold flex items-center gap-1"
              >
                <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
                <span>العودة للقائمة</span>
              </button>
              <span className="text-neutral-300">|</span>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {formData.id ? `تعديل: ${formData.title}` : "إنشاء صفحة هبوط جديدة"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {formData.slug && (
                <a
                  href={`/lp/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold text-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Eye className="h-4 w-4" />
                  <span>معاينة مباشرة</span>
                </a>
              )}
              <PremiumButton
                onClick={handleSave}
                loading={saving}
                variant="primary"
                className="px-6 py-2.5 text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>حفظ وتفعيل الصفحة الآن</span>
              </PremiumButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* العمود الأيمن: الإعدادات الأساسية والهيرو (8 أعمدة) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* بطاقة المنتج والرابط المخصص */}
              <PremiumCard hoverEffect={false} className="p-6 space-y-4">
                <h3 className="font-serif text-base font-bold border-b pb-2 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>1. تحديد المنتج المرتبط والرابط المخصص</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* اختيار المنتج من المتجر */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      اختر المنتج المستهدف من متجرك *
                    </label>
                    <select
                      value={formData.hero.productId}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full border rounded-xl p-3 text-xs bg-white dark:bg-neutral-900 font-semibold"
                    >
                      <option value="">-- اضغط لاختيار منتج وتعبئة بياناته تلقائياً --</option>
                      {products.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.title.ar} ({p.price} د.م.)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* الرابط المخصص */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      الرابط المخصص للصفحة (Slug) *
                    </label>
                    <div className="flex items-center">
                      <span className="bg-neutral-100 dark:bg-neutral-800 border border-l-0 rounded-r-xl px-3 py-3 text-xs font-mono text-neutral-500">
                        /lp/
                      </span>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                        className="w-full border rounded-l-xl p-3 text-xs font-mono focus:ring-1"
                        placeholder="argan-oil"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    العنوان الداخلي للحملة (للإدارة فقط)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded-xl p-3 text-xs"
                    placeholder="مثال: حملة تيك توك - زيت الأركان الأصيل"
                  />
                </div>
              </PremiumCard>

              {/* بطاقة العنوان الرئيسي والوصف (Hero Copywriting) */}
              <PremiumCard hoverEffect={false} className="p-6 space-y-4">
                <h3 className="font-serif text-base font-bold border-b pb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span>2. العنوان الجذاب والوصف المقنع (Hero Pitch)</span>
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      الشارة العلوية (Badge Text)
                    </label>
                    <input
                      type="text"
                      value={formData.hero.badge}
                      onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, badge: e.target.value } })}
                      className="w-full border rounded-xl p-3 text-xs"
                      placeholder="🔥 العرض الأقوى هذا الأسبوع • خصم يصل إلى 40%"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      العنوان الرئيسي الجذاب (Hero Headline بالعربية) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hero.title?.ar || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          title: { ...formData.hero.title, ar: e.target.value }
                        }
                      })}
                      className="w-full border rounded-xl p-3 text-xs font-bold"
                      placeholder="مثال: سر النقاء والجمال الدائم من قلب جبال الأطلس المغربي"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      الوصف الفرعي والفوائد الجوهرية (Subtitle Copywriting)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.hero.subtitle?.ar || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          subtitle: { ...formData.hero.subtitle, ar: e.target.value }
                        }
                      })}
                      className="w-full border rounded-xl p-3 text-xs leading-relaxed"
                      placeholder="اشرح المشكلة والحل وكيف يغير هذا المنتج حياة الزبون بشكل فوري وطبيعي..."
                    />
                  </div>

                  {/* رابط فيديو اختياري */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      رابط فيديو يوتيوب أو استعراض (اختياري)
                    </label>
                    <input
                      type="url"
                      value={formData.hero.videoUrl || ""}
                      onChange={(e) => setFormData({ ...formData, hero: { ...formData.hero, videoUrl: e.target.value } })}
                      className="w-full border rounded-xl p-3 text-xs font-mono"
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </div>
                </div>
              </PremiumCard>

              {/* معرض صور صفحة الهبوط */}
              <div className="border rounded-2xl p-4 bg-neutral-50/70 dark:bg-neutral-800/40">
                <MultiImageUploader
                  images={formData.hero.images || []}
                  onChange={(imgs) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, images: imgs }
                  })}
                  label="معرض صور صفحة الهبوط الإعلانية"
                  description="ارفع عدة صور عالية الجودة للمنتج لإبهار زوار الإعلانات. الصورة الأولى هي الصورة الأساسية لغلاف الصفحة."
                  maxImages={8}
                />
              </div>

              {/* بطاقة باقات الأسعار وعروض الكمية (Quantity & Price Offers) */}
              <PremiumCard hoverEffect={false} className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-serif text-base font-bold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span>3. باقات الأسعار وعروض الكمية (Quantity Discounts)</span>
                  </h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    مفتاح رفع الأرباح AOV
                  </span>
                </div>

                <div className="space-y-4">
                  {formData.hero.offers.map((offer: any, idx: number) => (
                    <div
                      key={offer.id || idx}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-neutral-700 dark:text-neutral-300">
                          الباقة {idx + 1}: {offer.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`popular-${idx}`}
                            checked={!!offer.isPopular}
                            onChange={(e) => updateOffer(idx, "isPopular", e.target.checked)}
                            className="h-4 w-4 accent-accent"
                          />
                          <label htmlFor={`popular-${idx}`} className="text-[11px] font-bold text-accent cursor-pointer">
                            تمييز كـ (الأكثر طلباً ⭐)
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-neutral-500">عنوان الباقة</label>
                          <input
                            type="text"
                            value={offer.title}
                            onChange={(e) => updateOffer(idx, "title", e.target.value)}
                            className="w-full border rounded-lg p-2.5 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-neutral-500">الكمية (قطع)</label>
                          <input
                            type="number"
                            value={offer.quantity}
                            onChange={(e) => updateOffer(idx, "quantity", Number(e.target.value))}
                            className="w-full border rounded-lg p-2.5 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-neutral-500">السعر النهائي (د.م.) *</label>
                          <input
                            type="number"
                            value={offer.price}
                            onChange={(e) => updateOffer(idx, "price", Number(e.target.value))}
                            className="w-full border rounded-lg p-2.5 font-mono font-bold text-emerald-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-neutral-500">السعر قبل الخصم</label>
                          <input
                            type="number"
                            value={offer.compareAtPrice || ""}
                            onChange={(e) => updateOffer(idx, "compareAtPrice", Number(e.target.value))}
                            className="w-full border rounded-lg p-2.5 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-neutral-500">شارة التوفير (Badge Text)</label>
                          <input
                            type="text"
                            value={offer.badge || ""}
                            onChange={(e) => updateOffer(idx, "badge", e.target.value)}
                            className="w-full border rounded-lg p-2.5"
                            placeholder="مثال: وفر 90 درهم + شحن مجاني"
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id={`shipping-${idx}`}
                            checked={offer.freeShipping !== false}
                            onChange={(e) => updateOffer(idx, "freeShipping", e.target.checked)}
                            className="h-4 w-4 accent-primary"
                          />
                          <label htmlFor={`shipping-${idx}`} className="font-bold text-neutral-700 dark:text-neutral-300">
                            شحن مجاني لهذه الباقة
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>

            </div>

            {/* العمود الأيسر: بيكسل فيسبوك + إعدادات SEO + الثقة (4 أعمدة) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* بطاقة فيسبوك بيكسل الخاصة بالحملة */}
              <PremiumCard hoverEffect={false} className="p-6 space-y-4 border-primary/30 bg-primary/[0.02]">
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span className="p-1 rounded-md bg-[#1877F2] text-white text-[10px] font-bold font-mono">f</span>
                    <span>Facebook Pixel للحملة</span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    تتبع أحداث الشراء (Purchase) وتأكيد الطلبات (Lead) بدقة متناهية لتحسين خوارزميات إعلانات Meta.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    معرف بيكسل فيسبوك (Pixel ID)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.facebookPixelId || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      hero: { ...formData.hero, facebookPixelId: e.target.value.trim() }
                    })}
                    className="w-full border rounded-xl p-3 text-xs font-mono"
                    placeholder="مثال: 123456789012345"
                  />
                  <span className="text-[10px] text-neutral-400 block">
                    إذا تركته فارغاً، سيتم استخدام البيكسل العام للمتجر تلقائياً.
                  </span>
                </div>
              </PremiumCard>

              {/* عناصر الإثارة وندرة المخزون */}
              <PremiumCard hoverEffect={false} className="p-6 space-y-4">
                <h3 className="font-serif text-sm font-bold border-b pb-2 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-accent" />
                  <span>عناصر السرعة والندرة (Urgency)</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-neutral-500 font-bold">القطع المتبقية في المخزون للعرض</label>
                    <input
                      type="number"
                      value={formData.hero.stockLeft || 7}
                      onChange={(e) => setFormData({
                        ...formData,
                        hero: { ...formData.hero, stockLeft: Number(e.target.value) }
                      })}
                      className="w-full border rounded-xl p-3 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActiveToggle"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <label htmlFor="isActiveToggle" className="font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                      تفعيل الصفحة واستقبال الطلبات فوراً
                    </label>
                  </div>
                </div>
              </PremiumCard>

              {/* إعدادات SEO للمشاركة على الواتساب والفيسبوك */}
              <PremiumCard hoverEffect={false} className="p-6 space-y-3">
                <h3 className="font-serif text-sm font-bold border-b pb-2">
                  معاينة المشاركة ومحركات البحث (SEO)
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-neutral-500">عنوان المشاركة (Meta Title)</label>
                    <input
                      type="text"
                      value={formData.seo?.title || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        seo: { ...formData.seo, title: e.target.value }
                      })}
                      className="w-full border rounded-xl p-2.5 text-xs"
                      placeholder="عنوان الرابط عند إرساله في واتساب..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-500">وصف المشاركة (Meta Description)</label>
                    <textarea
                      rows={2}
                      value={formData.seo?.description || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        seo: { ...formData.seo, description: e.target.value }
                      })}
                      className="w-full border rounded-xl p-2.5 text-xs"
                      placeholder="وصف تسويقي يظهر تحت الرابط..."
                    />
                  </div>
                </div>
              </PremiumCard>

              {/* زر الحفظ الكبير */}
              <PremiumButton
                onClick={handleSave}
                loading={saving}
                variant="primary"
                className="w-full py-4 text-sm font-black flex items-center justify-center gap-2 shadow-premium-lg"
              >
                <Save className="h-5 w-5" />
                <span>حفظ وتفعيل صفحة الهبوط الآن</span>
              </PremiumButton>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}