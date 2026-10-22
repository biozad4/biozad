"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { useCartStore } from "@/store/useCartStore";
import { useToastStore } from "@/store/useToastStore";
import { PremiumButton } from "@/components/ui/premium-button";
import { 
  Sparkles, Gift, ShoppingBag, Plus, Minus, Trash2, 
  CheckCircle2, ArrowRight, ShieldCheck, Truck, Award, Search, Check
} from "lucide-react";
import Link from "next/link";

interface CustomBundleBuilderProps {
  products: any[];
  settings: {
    minItems: number;
    tiers: { min_amount: number; discount_percent: number }[];
    bannerTitle: { ar: string; fr: string };
    bannerSubtitle: { ar: string; fr: string };
  };
}

interface SelectedBundleItem {
  productId: string;
  variantId?: string;
  weight?: string;
  title: { ar: string; fr: string };
  image: string;
  price: number;
  quantity: number;
}

export function CustomBundleBuilder({ products, settings }: CustomBundleBuilderProps) {
  const { lang } = useUIStore();
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToastStore();

  const [selectedItems, setSelectedItems] = useState<SelectedBundleItem[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // الفئات المتاحة للفلترة
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  // الحسابات المالية ونسب الخصم
  const totalItemsCount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [selectedItems]);

  const originalTotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [selectedItems]);

  // ترتيب مستويات الخصم
  const sortedTiers = useMemo(() => {
    return [...settings.tiers].sort((a, b) => a.min_amount - b.min_amount);
  }, [settings.tiers]);

  const maxTierAmount = useMemo(() => {
    return sortedTiers[sortedTiers.length - 1]?.min_amount || 500;
  }, [sortedTiers]);

  // الخصم المطبق حالياً
  const currentAppliedTier = useMemo(() => {
    // الخصم يطبق فقط إذا حقق الحد الأدنى لعدد المنتجات
    if (totalItemsCount < settings.minItems) return null;
    return [...sortedTiers].reverse().find((t) => originalTotal >= t.min_amount) || null;
  }, [sortedTiers, originalTotal, totalItemsCount, settings.minItems]);

  const currentDiscountPercent = currentAppliedTier?.discount_percent || 0;

  // المستوى القادم للتشجيع
  const nextTier = useMemo(() => {
    return sortedTiers.find((t) => t.min_amount > originalTotal) || null;
  }, [sortedTiers, originalTotal]);

  const amountToNextTier = nextTier ? nextTier.min_amount - originalTotal : 0;

  // الحسبة النهائية
  const discountAmount = Math.round((originalTotal * currentDiscountPercent) / 100);
  const finalPrice = Math.max(0, originalTotal - discountAmount);
  const meetsMinItems = totalItemsCount >= settings.minItems;

  // نسبة التقدم في شريط الخصم
  const progressPercent = Math.min(100, Math.round((originalTotal / maxTierAmount) * 100));

  // إدارة إضافة وإزالة المنتجات
  const handleAddProduct = (product: any) => {
    const prodId = product._id || product.id;
    const variant = selectedVariants[prodId] || (product.variants && product.variants[0]);
    const price = variant ? Number(variant.price) : Number(product.price);
    const weight = variant?.weight;
    const variantId = variant?.id || variant?.sku;

    const existingIdx = selectedItems.findIndex(
      (it) => it.productId === prodId && it.variantId === variantId
    );

    if (existingIdx > -1) {
      const updated = [...selectedItems];
      updated[existingIdx].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: prodId,
          variantId,
          weight,
          title: { ar: product.title.ar, fr: product.title.fr || product.title.ar },
          image: (product.images && product.images[0]) || "",
          price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (productId: string, variantId: string | undefined, delta: number) => {
    const updated = selectedItems
      .map((it) => {
        if (it.productId === productId && it.variantId === variantId) {
          const newQty = it.quantity + delta;
          return newQty > 0 ? { ...it, quantity: newQty } : null;
        }
        return it;
      })
      .filter(Boolean) as SelectedBundleItem[];

    setSelectedItems(updated);
  };

  const handleRemoveItem = (productId: string, variantId: string | undefined) => {
    setSelectedItems(
      selectedItems.filter(
        (it) => !(it.productId === productId && it.variantId === variantId)
      )
    );
  };

  // إضافة الباقة المخصصة بالكامل للسلة
  const handleAddCustomBundleToCart = () => {
    if (!meetsMinItems) {
      showToast(
        lang === "ar"
          ? `يرجى اختيار ${settings.minItems} منتجات على الأقل لتأكيد باقتك.`
          : `Veuillez sélectionner au moins ${settings.minItems} produits.`,
        "error"
      );
      return;
    }

    const bundleId = `custom-bundle-${Date.now()}`;
    const bundleSummary = selectedItems
      .map((it) => `${it.title[lang]} (${it.quantity})`)
      .join(" + ");

    addItem({
      id: bundleId,
      title: {
        ar: `🎁 باقة مخصصة (${totalItemsCount} عناصر)`,
        fr: `🎁 Pack Sur-Mesure (${totalItemsCount} articles)`,
      },
      price: finalPrice,
      image: selectedItems[0]?.image || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=800",
      weight: `${bundleSummary.slice(0, 80)}...`,
    });

    showToast(
      lang === "ar"
        ? `✓ تم إضافة باقتك المخصصة بتخفيض ${currentDiscountPercent}% بنجاح!`
        : `✓ Votre pack sur-mesure (${currentDiscountPercent}% off) a été ajouté !`,
      "success"
    );

    // تصفير الباقة بعد الإضافة
    setSelectedItems([]);
    setIsMobileDrawerOpen(false);
  };

  // فلترة المنتجات
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.title.fr && p.title.fr.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. رأس الصفحة الفاخر والمقدمة التسويقية */}
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-primary to-neutral-900 p-8 sm:p-12 text-white overflow-hidden shadow-premium-xl border border-emerald-800/40">
          <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Gift className="h-4 w-4 animate-bounce" />
              <span>{lang === "ar" ? "تجربة تسوق فريدة ومميزة" : "Expérience Sur-Mesure"}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              {settings.bannerTitle[lang] || settings.bannerTitle.ar}
            </h1>

            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl">
              {settings.bannerSubtitle[lang] || settings.bannerSubtitle.ar}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {lang === "ar" ? `حد أدنى ${settings.minItems} منتجات` : `Min ${settings.minItems} articles`}
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-emerald-400" />
                {lang === "ar" ? "توصيل سريع لكافة المدن" : "Livraison rapide"}
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-400" />
                {lang === "ar" ? "منتجات بلدية نقية 100%" : "100% Terroir Authentique"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. شريط الخصم التفاعلي الذكي (Gamified Tiered Discount Bar) */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-premium-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {lang === "ar" ? "مستويات التوفير والخصم التدريجي" : "Paliers d'Économie"}
              </span>
              <h3 className="text-lg font-serif font-black text-neutral-900 dark:text-white mt-0.5">
                {!meetsMinItems ? (
                  lang === "ar"
                    ? `اختر ${settings.minItems - totalItemsCount} منتج إضافي لتفعيل شروط الباقة`
                    : `Ajoutez encore ${settings.minItems - totalItemsCount} article(s)`
                ) : nextTier ? (
                  lang === "ar"
                    ? `تبقت لك فقط ${amountToNextTier} د.م. لتفتح خصم ${nextTier.discount_percent}%! 🔥`
                    : `Plus que ${amountToNextTier} DH pour débloquer ${nextTier.discount_percent}% ! 🔥`
                ) : (
                  lang === "ar"
                    ? `🎉 مبروك! لقد حصلت على أقصى تخفيض متاح (${currentDiscountPercent}%)!`
                    : `🎉 Félicitations ! Remise maximale débloquée (${currentDiscountPercent}%) !`
                )}
              </h3>
            </div>

            {currentDiscountPercent > 0 && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 px-4 py-2 rounded-2xl">
                <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  {lang === "ar" 
                    ? `أنت الآن توفر: ${discountAmount} د.م. (${currentDiscountPercent}%)`
                    : `Vous économisez : ${discountAmount} DH (${currentDiscountPercent}%)`}
                </span>
              </div>
            )}
          </div>

          {/* شريط التقدم الفعلي والمحطات */}
          <div className="space-y-2">
            <div className="relative h-3.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 rounded-full"
              />
            </div>

            {/* محطات مستويات الخصم */}
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-500 pt-1">
              <span>0 د.م.</span>
              {sortedTiers.map((tier, idx) => {
                const reached = originalTotal >= tier.min_amount && meetsMinItems;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 transition-colors ${
                      reached
                        ? "text-emerald-700 dark:text-emerald-400 font-bold"
                        : "text-neutral-400"
                    }`}
                  >
                    <span>{tier.min_amount} د.م.</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      reached
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black"
                        : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {tier.discount_percent}% خصم
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. التقسيم الرئيسي: شبكة المنتجات (8 أعمدة) + صندوق الباقة الحي (4 أعمدة) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* قسم المنتجات المتاحة */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* شريط البحث والفلترة */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              
              {/* محرك البحث */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "ar" ? "ابحث عن منتج بالاسم..." : "Rechercher un produit..."}
                  className="w-full pr-10 pl-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* أزرار الفئات */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                  }`}
                >
                  {lang === "ar" ? "الكل" : "Tous"} ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 capitalize ${
                      selectedCategory === cat
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* شبكة كروت المنتجات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const prodId = product._id || product.id;
                const hasVariants = product.variants && product.variants.length > 0;
                const activeVariant = selectedVariants[prodId] || (hasVariants ? product.variants[0] : null);
                const displayPrice = activeVariant ? Number(activeVariant.price) : Number(product.price);
                const activeVariantId = activeVariant?.id || activeVariant?.sku;

                // هل هذا المنتج مضاف حالياً في الباقة؟
                const selectedInBundle = selectedItems.find(
                  (it) => it.productId === prodId && it.variantId === activeVariantId
                );
                const inBundleQty = selectedInBundle?.quantity || 0;

                return (
                  <div
                    key={prodId}
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white dark:bg-neutral-900 group ${
                      inBundleQty > 0
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-premium-md"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 hover:shadow-premium-sm"
                    }`}
                  >
                    {/* الصورة والعلامة */}
                    <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <img
                        src={(product.images && product.images[0]) || "https://images.unsplash.com/photo-1589733901241-5e52479e4e5e?w=800"}
                        alt={product.title[lang]}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {inBundleQty > 0 && (
                        <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span>في باقتك ({inBundleQty})</span>
                        </span>
                      )}
                    </div>

                    {/* المحتوى والأسعار */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-serif font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">
                          {product.title[lang]}
                        </h4>

                        {/* محدد الوزن أو الحجم إن وُجد */}
                        {hasVariants && (
                          <div className="pt-1">
                            <select
                              value={activeVariantId}
                              onChange={(e) => {
                                const v = product.variants.find(
                                  (item: any) => (item.id || item.sku) === e.target.value
                                );
                                setSelectedVariants({ ...selectedVariants, [prodId]: v });
                              }}
                              className="w-full text-[11px] font-bold border rounded-xl p-1.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                            >
                              {product.variants.map((v: any) => (
                                <option key={v.id || v.sku} value={v.id || v.sku}>
                                  {v.weight} - {v.price} د.م.
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                            {displayPrice} د.م.
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                            <span className="text-xs text-neutral-400 line-through font-mono">
                              {product.compareAtPrice} د.م.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* زر الإضافة أو التحكم بالكمية */}
                      <div className="pt-2">
                        {inBundleQty > 0 ? (
                          <div className="flex items-center justify-between border-2 border-emerald-600 rounded-2xl overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/20 p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(prodId, activeVariantId, -1)}
                              className="h-7 w-7 rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 text-emerald-800 hover:bg-neutral-200 transition-colors shadow-xs"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-black font-mono text-emerald-900 dark:text-emerald-300">
                              {inBundleQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(prodId, activeVariantId, 1)}
                              className="h-7 w-7 rounded-xl flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            className="w-full py-2 px-3 rounded-2xl text-xs font-bold border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>{lang === "ar" ? "أضف إلى باقتي" : "Ajouter au pack"}</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed rounded-3xl p-8 space-y-2">
                  <p className="text-sm font-bold text-neutral-500">
                    {lang === "ar" ? "لا توجد منتجات مطابقة للبحث" : "Aucun produit trouvé"}
                  </p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                    className="text-xs text-emerald-600 underline font-bold"
                  >
                    {lang === "ar" ? "إعادة تعيين الفلاتر" : "Réinitialiser les filtres"}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 4. صندوق الباقة الحي الملتصق (Desktop Sticky Box Summary) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-premium-lg space-y-5">
              
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {lang === "ar" ? "محتويات باقتك" : "Votre Pack"}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {totalItemsCount} {lang === "ar" ? "منتجات مختارة" : "articles"}
                    </p>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <button
                    onClick={() => setSelectedItems([])}
                    className="text-[11px] text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    {lang === "ar" ? "تفريغ الصندوق" : "Vider"}
                  </button>
                )}
              </div>

              {/* قائمة العناصر المختارة */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800"
                  >
                    <img
                      src={item.image}
                      alt={item.title[lang]}
                      className="h-10 w-10 rounded-xl object-cover border shrink-0"
                    />

                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                        {item.title[lang]}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {item.price} د.م. {item.weight ? `• ${item.weight}` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg bg-white dark:bg-neutral-900 overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, item.variantId, -1)}
                          className="px-1.5 py-0.5 text-neutral-500 hover:bg-neutral-100"
                        >
                          -
                        </button>
                        <span className="px-1.5 font-bold font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, item.variantId, 1)}
                          className="px-1.5 py-0.5 text-neutral-500 hover:bg-neutral-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId, item.variantId)}
                        className="p-1 text-neutral-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedItems.length === 0 && (
                  <div className="py-10 text-center space-y-2 text-neutral-400">
                    <Gift className="h-8 w-8 mx-auto text-neutral-300" />
                    <p className="text-xs">
                      {lang === "ar"
                        ? "صندوق باقتك فارغ حالياً. انقر على المنتجات أعلاه لإضافتها."
                        : "Votre pack est vide. Cliquez sur les produits pour les ajouter."}
                    </p>
                  </div>
                )}
              </div>

              {/* ملخص الحسابات المالية */}
              {selectedItems.length > 0 && (
                <div className="border-t pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>{lang === "ar" ? "المجموع قبل التخفيض:" : "Total initial :"}</span>
                    <span className="font-mono font-bold">{originalTotal} د.م.</span>
                  </div>

                  {currentDiscountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{lang === "ar" ? `تخفيض الباقة (${currentDiscountPercent}%):` : `Remise pack (${currentDiscountPercent}%) :`}</span>
                      <span className="font-mono">-{discountAmount} د.م.</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-2 border-t text-neutral-900 dark:text-white">
                    <span className="font-bold text-sm">
                      {lang === "ar" ? "المجموع الصافي النهائي:" : "Total final net :"}
                    </span>
                    <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                      {finalPrice} د.م.
                    </span>
                  </div>
                </div>
              )}

              {/* زر الإضافة للسلة */}
              <PremiumButton
                onClick={handleAddCustomBundleToCart}
                disabled={!meetsMinItems}
                variant="primary"
                className={`w-full py-4 text-xs font-bold flex items-center justify-center gap-2 ${
                  !meetsMinItems ? "opacity-50 cursor-not-allowed" : "shadow-premium-md"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {!meetsMinItems
                    ? (lang === "ar" ? `اختر على الأقل ${settings.minItems} منتجات لتأكيد الباقة` : `Min ${settings.minItems} articles requis`)
                    : (lang === "ar" ? "أضف باقتي الخاصة إلى السلة 🛍️" : "Ajouter mon pack au panier 🛍️")}
                </span>
              </PremiumButton>

              <p className="text-[10px] text-center text-neutral-400">
                {lang === "ar" ? "✓ توصيل سريع وضمان أصالة المنتجات 100%" : "✓ Livraison rapide & 100% garanti"}
              </p>

            </div>
          </div>

        </div>

      </div>

      {/* 5. شريط عائم سفلي للهواتف الذكية (Mobile Sticky Floating Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="cursor-pointer space-y-0.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {totalItemsCount} {lang === "ar" ? "منتجات" : "articles"}
              </span>
              {currentDiscountPercent > 0 && (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                  -{currentDiscountPercent}%
                </span>
              )}
            </div>
            <p className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
              {finalPrice} د.م.
            </p>
          </div>

          <PremiumButton
            onClick={handleAddCustomBundleToCart}
            disabled={!meetsMinItems}
            variant="primary"
            className="flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>
              {!meetsMinItems
                ? (lang === "ar" ? `اختر ${settings.minItems} منتجات` : `Min ${settings.minItems}`)
                : (lang === "ar" ? "أضف باقتي للسلة" : "Ajouter au panier")}
            </span>
          </PremiumButton>
        </div>
      </div>

    </div>
  );
}
