"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface BundleItem {
  productId: string;
  title: { ar: string; fr: string };
  price: number;
  image?: string;
  weight?: string;
  quantity: number;
}

export interface CustomBundleTier {
  min_amount: number;
  discount_percent: number;
}

export interface CustomBundleSettings {
  id?: string;
  isActive: boolean;
  minItems: number;
  allowedProductIds: string[];
  tiers: CustomBundleTier[];
  bannerTitle: { ar: string; fr: string };
  bannerSubtitle: { ar: string; fr: string };
}

function mapBundle(b: any) {
  if (!b) return null;
  return {
    _id: b.id,
    id: b.id,
    title: { ar: b.title_ar, fr: b.title_fr },
    description: { ar: b.description_ar, fr: b.description_fr },
    price: Number(b.price),
    compareAtPrice: b.compare_at_price ? Number(b.compare_at_price) : undefined,
    image: (Array.isArray(b.images) && b.images[0]) || b.image || "",
    images: Array.isArray(b.images) && b.images.length > 0 ? b.images : (b.image ? [b.image] : []),
    isActive: b.is_active,
    isFeatured: !!b.is_featured,
    items: (Array.isArray(b.items) ? b.items : []) as BundleItem[],
    hotProductTitle: { ar: b.hot_product_title_ar, fr: b.hot_product_title_fr },
    hotProductSub: { ar: b.hot_product_sub_ar, fr: b.hot_product_sub_fr },
    hotProductImage: b.hot_product_image,
    hotProductLink: b.hot_product_link,
    createdAt: b.created_at,
  };
}

// 1. جلب بيانات الباقة المميزة المعروضة حالياً بالصفحة الرئيسية
export async function getFeaturedBundleSettings() {
  try {
    // نبحث أولاً عن الباقة المحددة كـ is_featured والنشطة
    let { data: bundle } = await supabase
      .from("featured_bundles")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true)
      .maybeSingle();

    // إذا لم تكن هناك باقة مميزة نشطة، نأخذ آخر باقة نشطة فقط
    if (!bundle) {
      const { data: activeBundle } = await supabase
        .from("featured_bundles")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      bundle = activeBundle;
    }

    // إذا لم تكن هناك أي باقة نشطة، لا نعرض شيئاً (null)
    return { success: true, bundle: bundle ? mapBundle(bundle) : null };
  } catch (error: any) {
    console.error("Error getting featured bundle settings:", error);
    return { success: false, message: error.message };
  }
}

// 2. جلب جميع الباقات للإدارة ولصفحة الباقات
export async function getAllBundles() {
  try {
    const { data: bundles, error } = await supabase
      .from("featured_bundles")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      bundles: (bundles || []).map(mapBundle),
    };
  } catch (error: any) {
    console.error("Error fetching all bundles:", error);
    return { success: false, bundles: [], message: error.message };
  }
}

// 2.5. جلب كافة الباقات النشطة لعرضها في المتجر والصفحة الرئيسية وقسم العروض
export async function getActiveBundles() {
  try {
    const { data: bundles, error } = await supabase
      .from("featured_bundles")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      bundles: (bundles || []).map(mapBundle),
    };
  } catch (error: any) {
    console.error("Error fetching active bundles:", error);
    return { success: false, bundles: [], message: error.message };
  }
}

// 3. تحديد باقة معينة لتكون هي المعروضة بالصفحة الرئيسية (Featured)
export async function setFeaturedBundle(bundleId: string) {
  try {
    // إلغاء تمييز جميع الباقات الأخرى
    await supabase
      .from("featured_bundles")
      .update({ is_featured: false })
      .neq("id", bundleId);

    // تمييز الباقة المختارة وتفعيلها تلقائياً
    const { data, error } = await supabase
      .from("featured_bundles")
      .update({ is_featured: true, is_active: true, updated_at: new Date().toISOString() })
      .eq("id", bundleId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");

    return {
      success: true,
      message: "✓ تم تعيين الباقة لتكون هي المعروضة في الصفحة الرئيسية بنجاح!",
      bundle: mapBundle(data),
    };
  } catch (error: any) {
    console.error("Error setting featured bundle:", error);
    return { success: false, message: error.message };
  }
}

// 4. تفعيل أو تعطيل باقة
export async function toggleBundleActive(bundleId: string, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from("featured_bundles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", bundleId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");

    return { success: true, message: "✓ تم تحديث حالة الباقة بنجاح!", bundle: mapBundle(data) };
  } catch (error: any) {
    console.error("Error toggling bundle active:", error);
    return { success: false, message: error.message };
  }
}

// 5. حفظ أو تعديل باقة (إنشاء جديد أو تحديث باقة حالية)
export async function saveFeaturedBundleSettings(data: any) {
  try {
    const { 
      id, title, description, price, compareAtPrice, image, images, isActive, isFeatured, items,
      hotProductTitle, hotProductSub, hotProductImage, hotProductLink
    } = data;

    const titleAr = title?.ar?.trim();
    const titleFr = title?.fr?.trim() || titleAr;
    const descAr = description?.ar?.trim();
    const descFr = description?.fr?.trim() || descAr;
    const imagesList = Array.isArray(images) && images.length > 0
      ? images.map((s: string) => s.trim()).filter(Boolean)
      : (image ? [image.trim()] : []);
    const bundleImage = imagesList[0] || image?.trim() || "";

    if (!titleAr || !descAr || !price || !bundleImage) {
      return { success: false, message: "يرجى تعبئة عنوان الباقة، الوصف، الثمن، وإضافة صورة واحدة على الأقل" };
    }

    const payload: any = {
      title_ar: titleAr,
      title_fr: titleFr,
      description_ar: descAr,
      description_fr: descFr,
      price: Number(price),
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
      image: bundleImage,
      images: imagesList,
      is_active: isActive !== false,
      items: Array.isArray(items) ? items : [],
      hot_product_title_ar: hotProductTitle?.ar?.trim() || null,
      hot_product_title_fr: hotProductTitle?.fr?.trim() || hotProductTitle?.ar?.trim() || null,
      hot_product_sub_ar: hotProductSub?.ar?.trim() || null,
      hot_product_sub_fr: hotProductSub?.fr?.trim() || hotProductSub?.ar?.trim() || null,
      hot_product_image: hotProductImage?.trim() || null,
      hot_product_link: hotProductLink?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (isFeatured !== undefined) {
      payload.is_featured = Boolean(isFeatured);
    }

    let saved;
    if (id) {
      // تعديل باقة قائمة
      if (payload.is_featured) {
        await supabase.from("featured_bundles").update({ is_featured: false }).neq("id", id);
      }
      const { data: updated, error } = await supabase
        .from("featured_bundles")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      saved = updated;
    } else {
      // إنشاء باقة جديدة
      if (payload.is_featured) {
        await supabase.from("featured_bundles").update({ is_featured: false });
      }
      const { data: inserted, error } = await supabase
        .from("featured_bundles")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      saved = inserted;
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");

    return { 
      success: true, 
      message: id ? "✓ تم تحديث الباقة بنجاح!" : "✓ تم إنشاء الباقة الجديدة بنجاح!", 
      bundle: mapBundle(saved)
    };
  } catch (error: any) {
    console.error("Error saving bundle:", error);
    return { success: false, message: `فشل الحفظ: ${error.message}` };
  }
}

// 6. حذف باقة
export async function deleteBundle(bundleId: string) {
  try {
    const { data: targetBundle } = await supabase
      .from("featured_bundles")
      .select("is_featured")
      .eq("id", bundleId)
      .maybeSingle();

    const { error } = await supabase
      .from("featured_bundles")
      .delete()
      .eq("id", bundleId);

    if (error) throw error;

    // إذا كانت الباقة المحذوفة هي الـ Featured، نجعل باقة أخرى نشطة كـ Featured
    if (targetBundle?.is_featured) {
      const { data: nextBundle } = await supabase
        .from("featured_bundles")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (nextBundle) {
        await supabase
          .from("featured_bundles")
          .update({ is_featured: true })
          .eq("id", nextBundle.id);
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");

    return { success: true, message: "✓ تم حذف الباقة بنجاح!" };
  } catch (error: any) {
    console.error("Error deleting bundle:", error);
    return { success: false, message: `فشل الحذف: ${error.message}` };
  }
}

// -------------------------------------------------------------
// 7. إعدادات "شكّل باقتك المخصصة" (Build Your Own Bundle)
// -------------------------------------------------------------

function mapCustomSettings(s: any): CustomBundleSettings {
  if (!s) {
    return {
      isActive: true,
      minItems: 2,
      allowedProductIds: [],
      tiers: [
        { min_amount: 300, discount_percent: 10 },
        { min_amount: 500, discount_percent: 15 },
      ],
      bannerTitle: { ar: "شكّل باقتك المخصصة", fr: "Composez Votre Pack Sur-Mesure" },
      bannerSubtitle: {
        ar: "اختر منتجاتك المفضلة واستفد من تخفيض فوري متصاعد يصل إلى 15% وأكثر!",
        fr: "Choisissez vos produits préférés et profitez de réductions immédiates!",
      },
    };
  }

  return {
    id: s.id,
    isActive: s.is_active !== false,
    minItems: Number(s.min_items) || 2,
    allowedProductIds: Array.isArray(s.allowed_product_ids) ? s.allowed_product_ids : [],
    tiers: Array.isArray(s.tiers) ? s.tiers : [
      { min_amount: 300, discount_percent: 10 },
      { min_amount: 500, discount_percent: 15 },
    ],
    bannerTitle: s.banner_title || { ar: "شكّل باقتك المخصصة", fr: "Composez Votre Pack Sur-Mesure" },
    bannerSubtitle: s.banner_subtitle || {
      ar: "اختر منتجاتك المفضلة واستفد من تخفيض فوري متصاعد يصل إلى 15% وأكثر!",
      fr: "Choisissez vos produits préférés et profitez de réductions immédiates!",
    },
  };
}

export async function getCustomBundleSettings() {
  try {
    const { data, error } = await supabase
      .from("custom_bundle_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return { success: true, settings: mapCustomSettings(data) };
  } catch (error: any) {
    console.error("Error getting custom bundle settings:", error);
    return { success: false, settings: mapCustomSettings(null), message: error.message };
  }
}

export async function saveCustomBundleSettings(settings: Partial<CustomBundleSettings>) {
  try {
    const payload = {
      is_active: settings.isActive !== false,
      min_items: Math.max(1, Number(settings.minItems) || 2),
      allowed_product_ids: settings.allowedProductIds || [],
      tiers: settings.tiers || [
        { min_amount: 300, discount_percent: 10 },
        { min_amount: 500, discount_percent: 15 },
      ],
      banner_title: settings.bannerTitle,
      banner_subtitle: settings.bannerSubtitle,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("custom_bundle_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    let saved;
    if (existing) {
      const { data, error } = await supabase
        .from("custom_bundle_settings")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      saved = data;
    } else {
      const { data, error } = await supabase
        .from("custom_bundle_settings")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      saved = data;
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/custom-bundle", "layout");

    return { 
      success: true, 
      message: "✓ تم حفظ إعدادات الباقة المخصصة بنجاح!", 
      settings: mapCustomSettings(saved) 
    };
  } catch (error: any) {
    console.error("Error saving custom bundle settings:", error);
    return { success: false, message: `فشل الحفظ: ${error.message}` };
  }
}

// 8. جلب المنتجات المتاحة للباقة المخصصة
export async function getCustomBundleProducts() {
  try {
    const settingsRes = await getCustomBundleSettings();
    const settings = settingsRes.settings;

    if (!settings.isActive) {
      return { success: true, products: [], isEnabled: false };
    }

    // جلب المنتجات المحددة في allowedProductIds أو جميع المنتجات النشطة إذا لم يتم التحديد
    let query = supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("is_active", true);

    if (settings.allowedProductIds && settings.allowedProductIds.length > 0) {
      query = query.in("id", settings.allowedProductIds);
    }

    const { data: prods, error } = await query;
    if (error) throw error;

    const mapped = (prods || []).map((p: any) => ({
      _id: p.id,
      id: p.id,
      title: { ar: p.title_ar, fr: p.title_fr || p.title_ar },
      description: { ar: p.description_ar, fr: p.description_fr },
      price: Number(p.price),
      compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
      images: Array.isArray(p.images) ? p.images : [],
      category: p.category_id,
      stockQuantity: Number(p.stock_quantity) || 0,
      variants: (p.product_variants || []).map((v: any) => ({
        id: v.id,
        sku: v.sku,
        weight: v.weight,
        price: Number(v.price),
        compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
        stockQuantity: Number(v.stock_quantity) || 0,
      })),
    }));

    return { success: true, products: mapped, isEnabled: true, settings };
  } catch (error: any) {
    console.error("Error fetching custom bundle products:", error);
    return { success: false, products: [], isEnabled: false, message: error.message };
  }
}
