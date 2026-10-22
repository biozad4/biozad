"use client";

import React, { useEffect, useState } from "react";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { InventoryManagement } from "@/components/admin/InventoryManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { getAdminProducts, upsertProduct, deleteProduct } from "@/app/actions/adminProducts";
import { getAdminCoupons, createAdminCoupon, deleteAdminCoupon } from "@/app/actions/coupons";
import { getFeaturedBundleSettings, saveFeaturedBundleSettings } from "@/app/actions/featuredBundle";
import { uploadImageToCloudinary } from "@/app/actions/upload";
import { getStoreSettings, saveStoreSettings } from "@/app/actions/storeSettings";
import { DEFAULT_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { useToastStore } from "@/store/useToastStore";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { BundleManagement } from "@/components/admin/BundleManagement";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
import { LandingPageBuilder } from "@/components/admin/LandingPageBuilder";
import { Plus, Pencil, Trash2, LayoutDashboard, PackagePlus, RefreshCw, Award, Image, AlignLeft, Sparkles, Package, Flame } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "bundle" | "landing" | "inventory" | "coupons" | "orders">("dashboard");
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const { showToast, showConfirm } = useToastStore();

  // حالة التحكم بالمتغيرات (الأوزان والأحجام)
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<any[]>([
    { weight: "1kg", price: "", compareAtPrice: "", stock: "", sku: "", barcode: "" }
  ]);

  // حالات فورم إضافة وتعديل منتج
  const [showForm, setShowForm] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    titleAr: "", titleFr: "", sku: "", barcode: "", price: "", compareAtPrice: "", stock: "", category: "amlou",
    descAr: "", descFr: "", imagesCsv: "", isFeatured: false, isBundle: false
  });

  // حالات الكوبون الجديد
  const [couponForm, setCouponForm] = useState({
    code: "", discountType: "fixed" as "fixed" | "percentage", discountValue: "",
    appliesToType: "all" as "all" | "category" | "product" | "variant_weight",
    targetCategoryId: "", targetProductId: "", targetWeight: ""
  });

  const [bundleForm, setBundleForm] = useState({
    titleAr: "", titleFr: "", descAr: "", descFr: "", price: "", compareAtPrice: "", image: "", isActive: true,
    hotTitleAr: "", hotTitleFr: "", hotSubAr: "", hotSubFr: "", hotImage: "", hotLink: ""
  });
  const [bundleLoading, setBundleLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadImageToCloudinary(fd);
    if (res.success && res.url) {
      const resUrl = res.url || "";
      const currentVal = formData.imagesCsv.trim();
      const newVal = currentVal ? `${currentVal}\n${resUrl}` : resUrl;
      setFormData({ ...formData, imagesCsv: newVal });
      showToast("✓ تم رفع الصورة وحفظها بنجاح!", "success");
    } else {
      showToast(res.message || "فشل رفع الصورة", "error");
    }
    setUploading(false);
  };

  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: "bundleImage" | "hotImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadImageToCloudinary(fd);
    if (res.success && res.url) {
      if (targetField === "bundleImage") {
        setBundleForm((prev) => ({ ...prev, image: res.url || "" }));
      } else {
        setBundleForm((prev) => ({ ...prev, hotImage: res.url || "" }));
      }
      showToast("✓ تم رفع الصورة بنجاح!", "success");
    } else {
      showToast(res.message || "فشل رفع الصورة", "error");
    }
    setUploading(false);
  };

  const [shippingForm, setShippingForm] = useState({
    shippingCost: "40",
    freeShippingMin: "400",
    isFreeShippingGlobally: false,
    whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  });
  const [shippingLoading, setShippingLoading] = useState(false);

  const loadShippingSettings = async () => {
    const res = await getStoreSettings();
    if (res.success && res.settings) {
      setShippingForm({
        shippingCost: res.settings.shippingCost.toString(),
        freeShippingMin: res.settings.freeShippingMin.toString(),
        isFreeShippingGlobally: res.settings.isFreeShippingGlobally === true,
        whatsappNumber: res.settings.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
      });
    }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingLoading(true);
    const res = await saveStoreSettings({
      shippingCost: shippingForm.shippingCost,
      freeShippingMin: shippingForm.freeShippingMin,
      isFreeShippingGlobally: shippingForm.isFreeShippingGlobally,
      whatsappNumber: shippingForm.whatsappNumber,
    });

    if (res.success) {
      showToast(res.message, "success");
      if (res.settings) {
        setShippingForm({
          shippingCost: res.settings.shippingCost.toString(),
          freeShippingMin: res.settings.freeShippingMin.toString(),
          isFreeShippingGlobally: res.settings.isFreeShippingGlobally === true,
          whatsappNumber: res.settings.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
        });
      }
    } else {
      showToast(res.message || "حدث خطأ أثناء حفظ إعدادات المتجر", "error");
    }
    setShippingLoading(false);
  };

  const loadBundleSettings = async () => {
    const res = await getFeaturedBundleSettings();
    if (res.success && res.bundle) {
      setBundleForm({
        titleAr: res.bundle.title.ar,
        titleFr: res.bundle.title.fr,
        descAr: res.bundle.description.ar,
        descFr: res.bundle.description.fr,
        price: res.bundle.price.toString(),
        compareAtPrice: res.bundle.compareAtPrice ? res.bundle.compareAtPrice.toString() : "",
        image: res.bundle.image,
        isActive: res.bundle.isActive !== false,
        hotTitleAr: res.bundle.hotProductTitle?.ar || "",
        hotTitleFr: res.bundle.hotProductTitle?.fr || "",
        hotSubAr: res.bundle.hotProductSub?.ar || "",
        hotSubFr: res.bundle.hotProductSub?.fr || "",
        hotImage: res.bundle.hotProductImage || "",
        hotLink: res.bundle.hotProductLink || ""
      });
    }
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBundleLoading(true);
    const res = await saveFeaturedBundleSettings({
      title: { ar: bundleForm.titleAr, fr: bundleForm.titleFr },
      description: { ar: bundleForm.descAr, fr: bundleForm.descFr },
      price: bundleForm.price,
      compareAtPrice: bundleForm.compareAtPrice,
      image: bundleForm.image,
      isActive: bundleForm.isActive,
      hotProductTitle: { ar: bundleForm.hotTitleAr, fr: bundleForm.hotTitleFr },
      hotProductSub: { ar: bundleForm.hotSubAr, fr: bundleForm.hotSubFr },
      hotProductImage: bundleForm.hotImage,
      hotProductLink: bundleForm.hotLink
    });

    if (res.success) {
      showToast(res.message, "success");
      if (res.bundle) {
        setBundleForm({
          titleAr: res.bundle.title.ar,
          titleFr: res.bundle.title.fr,
          descAr: res.bundle.description.ar,
          descFr: res.bundle.description.fr,
          price: res.bundle.price.toString(),
          compareAtPrice: res.bundle.compareAtPrice ? res.bundle.compareAtPrice.toString() : "",
          image: res.bundle.image,
          isActive: res.bundle.isActive !== false,
          hotTitleAr: res.bundle.hotProductTitle?.ar || "",
          hotTitleFr: res.bundle.hotProductTitle?.fr || "",
          hotSubAr: res.bundle.hotProductSub?.ar || "",
          hotSubFr: res.bundle.hotProductSub?.fr || "",
          hotImage: res.bundle.hotProductImage || "",
          hotLink: res.bundle.hotProductLink || ""
        });
      }
    } else {
      showToast(res.message || "حدث خطأ أثناء حفظ الباقة", "error");
    }
    setBundleLoading(false);
  };

  const loadInitialData = async () => {
    setLoading(true);
    const prodRes = await getAdminProducts();
    const coupRes = await getAdminCoupons();
    if (prodRes.success && prodRes.products) setProducts(prodRes.products);
    if (coupRes.success && coupRes.coupons) setCoupons(coupRes.coupons);
    await loadBundleSettings();
    await loadShippingSettings();
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // التحكم بالمتغيرات يدوياً للآدمن
  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variantsList];
    updated[index][field] = value;
    setVariantsList(updated);
  };

  const addVariantRow = () => {
    setVariantsList([...variantsList, { weight: "500g", price: "", compareAtPrice: "", stock: "", sku: "", barcode: "" }]);
  };

  const removeVariantRow = (index: number) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
  };

  const generateRandomSku = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const code = `BZ-${formData.category.toUpperCase()}-${rand}`;
    setFormData((prev) => ({ ...prev, sku: code }));
  };

  const generateRandomBarcode = () => {
    const randDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const barcode = `611${randDigits}`;
    setFormData((prev) => ({ ...prev, barcode }));
  };

  const generateVariantSku = (index: number) => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const weightClean = (variantsList[index].weight || "VAR").replace(/\s+/g, "").toUpperCase();
    const code = `BZ-${formData.category.toUpperCase()}-${weightClean}-${rand}`;
    
    const updated = [...variantsList];
    updated[index].sku = code;
    setVariantsList(updated);
  };

  const generateVariantBarcode = (index: number) => {
    const randDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const barcode = `611${randDigits}`;
    
    const updated = [...variantsList];
    updated[index].barcode = barcode;
    setVariantsList(updated);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setHasVariants(false);
    setVariantsList([{ weight: "1kg", price: "", compareAtPrice: "", stock: "", sku: "", barcode: "" }]);
    setProductImages([]);
    setFormData({
      titleAr: "", titleFr: "", sku: "", barcode: "", price: "", compareAtPrice: "", stock: "", category: "amlou",
      descAr: "", descFr: "", imagesCsv: "", isFeatured: false, isBundle: false
    });
    setShowForm(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProduct(prod);
    const isVar = prod.variants && prod.variants.length > 0;
    setHasVariants(isVar);
    if (isVar) {
      setVariantsList(prod.variants);
    } else {
      setVariantsList([{ weight: "1kg", price: "", compareAtPrice: "", stock: "", sku: "", barcode: "" }]);
    }
    const currentImgs = Array.isArray(prod.images) ? prod.images : [];
    setProductImages(currentImgs);
    setFormData({
      titleAr: prod.title.ar,
      titleFr: prod.title.fr,
      sku: prod.sku,
      barcode: prod.barcode,
      price: prod.price ? prod.price.toString() : "",
      compareAtPrice: prod.compareAtPrice ? prod.compareAtPrice.toString() : "",
      stock: prod.stock ? prod.stock.toString() : "",
      category: prod.category || "amlou",
      descAr: prod.description?.ar || "",
      descFr: prod.description?.fr || "",
      imagesCsv: currentImgs.join("\n"),
      isFeatured: !!prod.isFeatured,
      isBundle: !!prod.isBundle
    });
    setShowForm(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      _id: editingProduct?._id || undefined,
      title: { ar: formData.titleAr, fr: formData.titleFr },
      sku: formData.sku,
      barcode: formData.barcode,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice,
      stock: formData.stock,
      category: formData.category,
      description: { ar: formData.descAr, fr: formData.descFr },
      images: productImages,
      variants: hasVariants ? variantsList : [],
      isFeatured: formData.isFeatured,
      isBundle: formData.isBundle
    };

    const res = await upsertProduct(payload);
    if (res.success) {
      showToast("✓ تم حفظ وتحديث السلعة بنجاح!", "success");
      setShowForm(false);
      loadInitialData();
    } else {
      showToast(res.message || "حدث خطأ أثناء الحفظ", "error");
    }
    setLoading(false);
  };

  const handleDeleteProduct = (id: string) => {
    showConfirm("هل تريد حذف هذا المنتج نهائياً؟", async () => {
      const res = await deleteProduct(id);
      if (res.success) {
        showToast(res.message, "success");
        loadInitialData();
      } else {
        showToast(res.message || "حدث خطأ أثناء حذف المنتج", "error");
      }
    });
  };

  // إدارة الكوبونات وتوجيهها
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createAdminCoupon(couponForm);
    if (res.success) {
      showToast("✓ تم إضافة الكوبون الموجه بنجاح!", "success");
      setCouponForm({
        code: "", discountType: "fixed", discountValue: "",
        appliesToType: "all", targetCategoryId: "", targetProductId: "", targetWeight: ""
      });
      loadInitialData();
    } else {
      showToast(res.message || "حدث خطأ أثناء إضافة الكوبون", "error");
    }
  };

  const handleDeleteCoupon = (id: string) => {
    showConfirm("هل تريد حذف هذا الكوبون؟", async () => {
      const res = await deleteAdminCoupon(id);
      if (res.success) {
        showToast(res.message, "success");
        loadInitialData();
      } else {
        showToast(res.message || "حدث خطأ أثناء حذف الكوبون", "error");
      }
    });
  };

  return (
    <div className="min-h-screen pb-12">
      
      {/* هيدر التبويبات الفاخر */}
      <div className="bg-white border-b border-neutral-200 px-8 py-4 flex justify-between items-center">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "dashboard" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-50"}`}>
            <LayoutDashboard className="h-4 w-4" />
            <span>لوحة المؤشرات</span>
          </button>
          <button onClick={() => setActiveTab("products")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "products" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-50"}`}>
            <PackagePlus className="h-4 w-4" />
            <span>إدارة المنتجات والأوزان</span>
          </button>
          <button onClick={() => setActiveTab("bundle")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "bundle" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-50"}`}>
            <Sparkles className="h-4 w-4" />
            <span>إدارة وعروض الباقات</span>
          </button>
          <button onClick={() => setActiveTab("landing")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "landing" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-50"}`}>
            <Flame className="h-4 w-4" />
            <span>صفحات الهبوط (Ads)</span>
          </button>
          <button onClick={() => setActiveTab("inventory")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "inventory" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-50"}`}>
            <RefreshCw className="h-4 w-4" />
            <span>المخزن وحركة البضائع</span>
          </button>
          <button onClick={() => setActiveTab("coupons")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "coupons" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-50"}`}>
            <Award className="h-4 w-4" />
            <span>كوبونات الخصم الموجهة</span>
          </button>
          <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "orders" ? "bg-primary text-white" : "text-neutral-500 hover:bg-neutral-50"}`}>
            <Package className="h-4 w-4" />
            <span>إدارة الطلبيات</span>
          </button>
        </div>
      </div>

      {activeTab === "dashboard" && <DashboardOverview />}
      {activeTab === "inventory" && <InventoryManagement />}
      {activeTab === "orders" && <OrdersManagement />}
      {activeTab === "landing" && (
        <div className="p-4 sm:p-8">
          <LandingPageBuilder products={products} />
        </div>
      )}

      {/* 2. تبويب إدارة المنتجات والأوزان (CRUD) */}
      {activeTab === "products" && (
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-800">جرد وتخصيص السلع الفاخرة</h2>
              <p className="text-xs text-neutral-500 mt-1">تعديل الأوزان، الأحجام، المخازن، والأسعار لكل صنف بدقة متناهية.</p>
            </div>
            <PremiumButton onClick={handleOpenAdd} variant="primary" className="flex items-center gap-1.5">
              <Plus className="h-4.5 w-4.5" />
              <span>إضافة منتج أو وزن جديد</span>
            </PremiumButton>
          </div>

          {showForm && (
            <PremiumCard hoverEffect={false} className="p-6 border-primary/20 bg-primary/[0.01] max-w-4xl space-y-6">
              <h3 className="font-serif text-lg font-bold mb-4 border-b pb-2">
                {editingProduct ? `تعديل تفاصيل: ${formData.titleAr}` : "إضافة منتج وتحديد خيارات الأوزان والأحجام"}
              </h3>
              
              <form onSubmit={handleSubmitProduct} className="space-y-6 text-xs font-semibold">
                
                {/* 1. الأسماء والتصنيف */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-neutral-500">اسم المنتج بالعربية *</label>
                    <input type="text" name="titleAr" required value={formData.titleAr} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-500">اسم المنتج بالفرنسية *</label>
                    <input type="text" name="titleFr" required value={formData.titleFr} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-500">الفئة *</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs bg-white">
                      <option value="amlou">أملو الفاخر</option>
                      <option value="honey">العسل الطبيعي الحر</option>
                      <option value="oils">الزيوت الطبيعية والتجميلية</option>
                      <option value="tea">الشاي المغربي الأصيل</option>
                      <option value="offers">العروض الخاصة والخصومات</option>
                      <option value="remedies">خلاطات ووصفات علاجية</option>
                      <option value="perfumes">عطور وبخور</option>
                      <option value="other">منتجات أخرى عامة</option>
                    </select>
                  </div>
                </div>

                {/* 2. الوصف والصور */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-neutral-500 flex items-center gap-1"><AlignLeft className="h-3.5 w-3.5" /> الوصف بالعربية</label>
                    <textarea name="descAr" rows={3} value={formData.descAr} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs" placeholder="اكتب وصفاً جذاباً للمنتج المغربي..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-500 flex items-center gap-1"><AlignLeft className="h-3.5 w-3.5" /> الوصف بالفرنسية</label>
                    <textarea name="descFr" rows={3} value={formData.descFr} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs" placeholder="Description du produit..." />
                  </div>
                </div>

                {/* معرض صور المنتج المباشر مع معاينة حية */}
                <div className="border rounded-2xl p-4 bg-neutral-50/60 dark:bg-neutral-800/30">
                  <MultiImageUploader
                    images={productImages}
                    onChange={setProductImages}
                    label="معرض صور المنتج"
                    description="ارفع عدة صور للمنتج من جهازك دفعة واحدة أو أضف برابط مباشر. الصورة الأولى تحمل علامة ⭐ وهي الصورة الرئيسية للمنتج."
                    maxImages={12}
                  />
                </div>

                {/* 2.5. خصائص الصفحة الرئيسية */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isFeatured" 
                      name="isFeatured"
                      checked={formData.isFeatured} 
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} 
                      className="h-4 w-4 accent-primary" 
                    />
                    <label htmlFor="isFeatured" className="text-xs font-bold text-neutral-700 cursor-pointer">
                      تمييز المنتج (يعرض في قسم "منتجات مميزة الأكثر طلباً" بالصفحة الرئيسية)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isBundle" 
                      name="isBundle"
                      checked={formData.isBundle} 
                      onChange={(e) => setFormData({ ...formData, isBundle: e.target.checked })} 
                      className="h-4 w-4 accent-primary" 
                    />
                    <label htmlFor="isBundle" className="text-xs font-bold text-neutral-700 cursor-pointer">
                      باقة العرض المميزة (تعرض كباقة السعادة الشاملة في أعلى الصفحة الرئيسية)
                    </label>
                  </div>
                </div>

                {/* 3. خيارات الأوزان والأحجام الديناميكية */}
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="hasVariants" 
                        checked={hasVariants} 
                        onChange={(e) => setHasVariants(e.target.checked)} 
                        className="h-4 w-4 accent-primary" 
                      />
                      <label htmlFor="hasVariants" className="text-xs font-bold text-neutral-700 cursor-pointer">
                        هل يحتوي هذا المنتج على خيارات أوزان/أحجام مختلفة؟ (مثال: عسل 1كغ، 500غ، أو أوزان مختلفة)
                      </label>
                    </div>

                    {hasVariants && (
                      <PremiumButton type="button" onClick={addVariantRow} variant="outline" className="py-2 text-[10px]">
                        + إضافة وزن آخر
                      </PremiumButton>
                    )}
                  </div>

                  {hasVariants ? (
                    // إضافة أوزان ديناميكية غير محدودة
                    <div className="space-y-3">
                      {variantsList.map((v, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-100 items-end">
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400">الوزن / الحجم / المقاس</label>
                            <input type="text" placeholder="مثال: 1kg, 500g, 1L" value={v.weight} onChange={(e) => handleVariantChange(index, "weight", e.target.value)} className="w-full border rounded-lg p-2 text-xs" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400">الثمن (درهم) *</label>
                            <input type="number" placeholder="مثال: 150" value={v.price} onChange={(e) => handleVariantChange(index, "price", e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400">الثمن القديم (خصم)</label>
                            <input type="number" placeholder="اختياري" value={v.compareAtPrice} onChange={(e) => handleVariantChange(index, "compareAtPrice", e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400">مخزون هذا الوزن *</label>
                            <input type="number" placeholder="مثال: 30" value={v.stock} onChange={(e) => handleVariantChange(index, "stock", e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-neutral-400">رمز الـ SKU</label>
                              <button type="button" onClick={() => generateVariantSku(index)} className="text-[8px] text-primary hover:underline font-bold transition-all">توليد ⚡</button>
                            </div>
                            <input type="text" placeholder="فريد" value={v.sku} onChange={(e) => handleVariantChange(index, "sku", e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] text-neutral-400">الباركود (POS)</label>
                              <button type="button" onClick={() => generateVariantBarcode(index)} className="text-[8px] text-primary hover:underline font-bold transition-all">توليد ⚡</button>
                            </div>
                            <div className="flex gap-1 items-center">
                              <input type="text" placeholder="Barcode" value={v.barcode} onChange={(e) => handleVariantChange(index, "barcode", e.target.value)} className="w-full border rounded-lg p-2 text-xs font-mono" />
                              {variantsList.length > 1 && (
                                <button type="button" onClick={() => removeVariantRow(index)} className="text-rose-500 hover:text-rose-700 font-bold p-1">✕</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // المنتج العادي بدون أوزان فرعية
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-neutral-500">رمز الـ SKU الأساسي *</label>
                          <button type="button" onClick={generateRandomSku} className="text-[10px] text-primary hover:underline font-bold transition-all">توليد ⚡</button>
                        </div>
                        <input type="text" name="sku" required={!hasVariants} value={formData.sku} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-neutral-500">الباركود الأساسي (للـ POS) *</label>
                          <button type="button" onClick={generateRandomBarcode} className="text-[10px] text-primary hover:underline font-bold transition-all">توليد ⚡</button>
                        </div>
                        <input type="text" name="barcode" required={!hasVariants} value={formData.barcode} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-neutral-500">ثمن البيع (درهم) *</label>
                        <input type="number" name="price" required={!hasVariants} value={formData.price} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-neutral-500">السعر القديم قبل الخصم</label>
                        <input type="number" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-neutral-500">الكمية المتوفرة بالمخزن *</label>
                        <input type="number" name="stock" required={!hasVariants} value={formData.stock} onChange={handleInputChange} className="w-full border rounded-xl p-3 text-xs font-mono" />
                      </div>
                    </div>
                  )}
                </div>

                {/* أزرار الحفظ */}
                <div className="flex gap-2 border-t pt-4">
                  <PremiumButton type="submit" loading={loading} variant="primary" className="py-3 text-xs">
                    {editingProduct ? "حفظ التعديلات" : "إضافة السلعة بنجاح"}
                  </PremiumButton>
                  <PremiumButton type="button" onClick={() => setShowForm(false)} variant="outline" className="py-3 text-xs">
                    إلغاء
                  </PremiumButton>
                </div>

              </form>
            </PremiumCard>
          )}

          {/* جدول عرض جرد السلع */}
          <PremiumCard hoverEffect={false} className="p-6 overflow-x-auto">
            <table className="w-full text-xs text-right text-neutral-500">
              <thead className="text-[10px] text-neutral-400 uppercase border-b">
                <tr>
                  <th className="py-3 px-4">اسم المنتج</th>
                  <th className="py-3 px-4">الفئة المغربية</th>
                  <th className="py-3 px-4">الأوزان / الأحجام والأسعار المتوفرة</th>
                  <th className="py-3 px-4">إجمالي الكمية بالمخزن</th>
                  <th className="py-3 px-4 text-left">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((prod) => {
                  const hasVars = prod.variants && prod.variants.length > 0;
                  return (
                    <tr key={prod._id} className="hover:bg-neutral-50">
                      <td className="py-4 px-4 font-bold text-neutral-800">{prod.title.ar}</td>
                      <td className="py-4 px-4 font-semibold text-neutral-400">{prod.category ? "نشط" : "N/A"}</td>
                      <td className="py-4 px-4">
                        {hasVars ? (
                          <div className="flex flex-wrap gap-1">
                            {prod.variants.map((v: any, i: number) => (
                              <span key={i} className="bg-neutral-100 dark:bg-neutral-900 border text-[9px] font-bold px-2 py-0.5 rounded">
                                {v.weight}: {v.price} د.م. (مخزن: {v.stock})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-bold text-primary">{prod.price} د.م.</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-extrabold ${prod.stock <= 5 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {prod.stock} وحدات
                        </span>
                      </td>
                      <td className="py-4 px-4 text-left flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(prod)} className="p-2 text-neutral-400 hover:text-blue-600 border rounded-lg hover:bg-blue-50 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(prod._id)} className="p-2 text-neutral-400 hover:text-rose-600 border rounded-lg hover:bg-rose-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </PremiumCard>
        </div>
      )}

      {/* 3. تبويب إدارة الكوبونات الموجهة للأوزان والفئات والسلع */}
      {activeTab === "coupons" && (
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* فورم إضافة كوبون موجه */}
            <div className="lg:col-span-5">
              <PremiumCard hoverEffect={false} className="p-6 space-y-4">
                <h3 className="text-sm font-bold border-b pb-2 flex items-center gap-1.5"><Plus className="h-4 w-4 text-accent" /> إضافة كوبون خصم موجه</h3>
                <form onSubmit={handleAddCoupon} className="space-y-4 text-xs font-semibold">
                  
                  <div className="space-y-1">
                    <label className="text-neutral-500">كود الخصم (كود الكوبون) *</label>
                    <input type="text" required placeholder="مثال: ARGAN20, CODHONEY" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} className="w-full border rounded-xl p-3 text-xs font-mono uppercase tracking-wider" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-neutral-500">نوع الخصم</label>
                      <select value={couponForm.discountType} onChange={(e: any) => setCouponForm({ ...couponForm, discountType: e.target.value })} className="w-full border rounded-xl p-3 bg-white">
                        <option value="fixed">مبلغ مالي ثابت (درهم)</option>
                        <option value="percentage">نسبة مئوية (%)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-neutral-500">قيمة الخصم *</label>
                      <input type="number" required placeholder="مثال: 50 أو 10" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })} className="w-full border rounded-xl p-3 text-xs font-mono" />
                    </div>
                  </div>

                  {/* تحديد التوجيه للكوبون */}
                  <div className="space-y-1">
                    <label className="text-neutral-500">مستوى تطبيق الخصم</label>
                    <select value={couponForm.appliesToType} onChange={(e: any) => setCouponForm({ ...couponForm, appliesToType: e.target.value })} className="w-full border rounded-xl p-3 bg-white">
                      <option value="all">على كل شيء فالموقع (عام)</option>
                      <option value="category">على فئة محددة فقط</option>
                      <option value="product">على منتج واحد محدد بالاسم</option>
                      <option value="variant_weight">على وزن محدد فقط (مثلاً: الكيلو غرام فقط)</option>
                    </select>
                  </div>

                  {/* إذا اختار التوجيه لوزن محدد */}
                  {couponForm.appliesToType === "variant_weight" && (
                    <div className="space-y-1">
                      <label className="text-neutral-500">اكتب الوزن المستهدف بالخصم *</label>
                      <input type="text" required placeholder="مثال: 1kg, 500g, 1L" value={couponForm.targetWeight} onChange={(e) => setCouponForm({ ...couponForm, targetWeight: e.target.value })} className="w-full border rounded-xl p-3 text-xs" />
                    </div>
                  )}

                  {/* إذا اختار فئة محددة */}
                  {couponForm.appliesToType === "category" && (
                    <div className="space-y-1">
                      <label className="text-neutral-500">اختر الفئة المستهدفة</label>
                      <select value={couponForm.targetCategoryId} onChange={(e) => setCouponForm({ ...couponForm, targetCategoryId: e.target.value })} className="w-full border rounded-xl p-3 bg-white">
                        <option value="">-- اختر الفئة --</option>
                        <option value="amlou">أملو الفاخر</option>
                        <option value="tea">الشاي المغربي</option>
                        <option value="bundles">الباقات</option>
                        <option value="offers">العروض</option>
                        <option value="furniture">الأثاث والديكور</option>
                      </select>
                    </div>
                  )}

                  {/* إذا اختار منتج محدد */}
                  {couponForm.appliesToType === "product" && (
                    <div className="space-y-1">
                      <label className="text-neutral-500">حدد المنتج المستهدف</label>
                      <select value={couponForm.targetProductId} onChange={(e) => setCouponForm({ ...couponForm, targetProductId: e.target.value })} className="w-full border rounded-xl p-3 bg-white">
                        <option value="">-- حدد المنتج --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>{p.title.ar}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <PremiumButton type="submit" variant="primary" className="w-full py-3.5 text-xs font-bold">
                    نشر وتفعيل كود الخصم الموجه
                  </PremiumButton>

                </form>
              </PremiumCard>
            </div>

            {/* جدول عرض الكوبونات المتاحة */}
            <div className="lg:col-span-7">
              <PremiumCard hoverEffect={false} className="p-6 space-y-4">
                <h3 className="text-sm font-bold border-b pb-2 flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" /> كوبونات الخصم النشطة حالياً</h3>
                <div className="divide-y divide-neutral-100">
                  {coupons.map((coup) => (
                    <div key={coup._id} className="flex justify-between items-center py-4 text-xs">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-primary dark:text-accent bg-neutral-50 border px-2.5 py-1 rounded-lg text-sm">{coup.code}</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[9px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                            الخصم: {coup.discountValue} {coup.discountType === "fixed" ? "درهم" : "%"}
                          </span>
                          <span className="text-[9px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                            المستوى: {coup.appliesToType} {coup.targetWeight ? `(${coup.targetWeight})` : ""}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCoupon(coup._id)} className="p-2 text-neutral-400 hover:text-rose-600 border rounded-lg hover:bg-rose-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {coupons.length === 0 && (
                    <div className="text-center py-12 text-neutral-400">لا يوجد كوبونات خصم نشطة حالياً.</div>
                  )}
                </div>
              </PremiumCard>
            </div>

          </div>
        </div>
      )}

      {/* 5. تبويب إدارة وعروض الباقات */}
      {activeTab === "bundle" && (
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8 space-y-6">
          <BundleManagement products={products} />

          {/* إعدادات كلفة الشحن والتوصيل المجاني */}
          <PremiumCard hoverEffect={false} className="p-6 space-y-6 mt-6">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-neutral-900">إعدادات الشحن والتوصيل ورقم واتساب الطلبيات</h3>
              <p className="text-xs text-neutral-400">تحكم في كلفة الشحن، العتبة المالية للشحن المجاني، ورقم الواتساب الذي يستقبل رسائل الطلبيات فوراً.</p>
            </div>

            <form onSubmit={handleSaveShipping} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-neutral-500">كلفة الشحن والتوصيل العادية (درهم) *</label>
                  <input
                    type="number"
                    required
                    value={shippingForm.shippingCost}
                    onChange={(e) => setShippingForm({ ...shippingForm, shippingCost: e.target.value })}
                    className="w-full border rounded-xl p-3 font-mono"
                    placeholder="مثال: 40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-neutral-500">حد التوصيل المجاني (المبلغ X بالدرهم) *</label>
                  <input
                    type="number"
                    required
                    value={shippingForm.freeShippingMin}
                    onChange={(e) => setShippingForm({ ...shippingForm, freeShippingMin: e.target.value })}
                    className="w-full border rounded-xl p-3 font-mono"
                    placeholder="مثال: 400"
                  />
                </div>
              </div>

              {/* رقم الواتساب لصاحب المتجر */}
              <div className="space-y-1.5 border-t pt-4">
                <label className="text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1.5 text-xs">
                  <span>رقم واتساب المتجر لتحويل الطلبيات إليه مباشرة (WhatsApp صاحب المحل) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.whatsappNumber}
                  onChange={(e) => setShippingForm({ ...shippingForm, whatsappNumber: e.target.value })}
                  className="w-full border rounded-xl p-3 font-mono text-xs"
                  placeholder="مثال: 212600000000 أو 0612345678"
                />
                <p className="text-[10px] text-neutral-400">
                  سيتم تحويل جميع تفاصيل الطلبيات الجديدة من صفحات الهبوط والمتجر مباشرة إلى هذا الرقم على واتساب بمجرد نقر الزبون على إتمام الطلب.
                </p>
              </div>

              <div className="flex items-center gap-2 border-t pt-4">
                <input
                  type="checkbox"
                  id="isFreeShippingGlobally"
                  checked={shippingForm.isFreeShippingGlobally}
                  onChange={(e) => setShippingForm({ ...shippingForm, isFreeShippingGlobally: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                <label htmlFor="isFreeShippingGlobally" className="text-xs font-bold text-neutral-700 cursor-pointer">
                  تفعيل التوصيل مجاناً لكافة الطلبات والزبناء (تخطي شروط الحد الأدنى)
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <PremiumButton type="submit" loading={shippingLoading} variant="primary" className="px-10 py-3.5 text-xs">
                  حفظ إعدادات المتجر ورقم الواتساب
                </PremiumButton>
              </div>
            </form>
          </PremiumCard>
        </div>
      )}

    </div>
  );
}