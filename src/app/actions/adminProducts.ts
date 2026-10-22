"use server";

import { supabase, query as pgQuery } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

function mapAdminProduct(p: any) {
  return {
    _id: p.id,
    id: p.id,
    title: { ar: p.title_ar, fr: p.title_fr },
    description: { ar: p.description_ar, fr: p.description_fr },
    benefits: { ar: p.benefits_ar, fr: p.benefits_fr },
    ingredients: { ar: p.ingredients_ar, fr: p.ingredients_fr },
    usage: { ar: p.usage_ar, fr: p.usage_fr },
    price: Number(p.price),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
    stock: p.stock,
    minStock: p.min_stock,
    sku: p.sku,
    barcode: p.barcode,
    images: p.images || [],
    slug: p.slug,
    isActive: p.is_active,
    isFeatured: p.is_featured,
    isBundle: p.is_bundle,
    category: p.category_id,
    variants: (p.product_variants || []).map((v: any) => ({
      _id: v.id,
      sku: v.sku,
      barcode: v.barcode,
      weight: v.weight,
      price: Number(v.price),
      compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
      stock: v.stock,
    })),
    createdAt: p.created_at,
  };
}

// 1. جلب كافة المنتجات للإدارة
export async function getAdminProducts() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, products: (products || []).map(mapAdminProduct) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 2. إضافة أو تعديل منتج
export async function upsertProduct(data: any) {
  try {
    const { 
      _id, title, sku, barcode, price, compareAtPrice, stock, 
      category, description, images, variants, isFeatured, isBundle 
    } = data;

    let finalSku = sku;
    let finalBarcode = barcode;

    if (variants && variants.length > 0) {
      if (!finalSku) finalSku = variants[0].sku;
      if (!finalBarcode) finalBarcode = variants[0].barcode;
    }

    if (!title?.ar || !finalSku || !finalBarcode || !category) {
      return { success: false, message: "الرجاء تعبئة كافة الحقول الأساسية المطلوبة" };
    }

    // حل معرّف القسم تلقائياً
    let { data: categoryDoc } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();

    if (!categoryDoc) {
      const fallbackNames: Record<string, { ar: string; fr: string }> = {
        amlou: { ar: "أملو الفاخر", fr: "Amlou" },
        tea: { ar: "الشاي المغربي", fr: "Thé" },
        bundles: { ar: "الباقات", fr: "Coffrets" },
        offers: { ar: "العروض", fr: "Offres" },
        furniture: { ar: "الأثاث التقليدي", fr: "Artisanat" }
      };
      const names = fallbackNames[category] || { ar: category, fr: category };
      const { data: createdCat } = await supabase
        .from("categories")
        .insert({ slug: category, name_ar: names.ar, name_fr: names.fr, is_active: true })
        .select("id")
        .single();
      categoryDoc = createdCat;
    }

    const rawSlugSource = title.fr || title.ar || "product";
    const cleanSlug = rawSlugSource
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const generatedSlug = `${cleanSlug}-${finalSku.toLowerCase()}`;

    let finalStock = Number(stock || 0);
    if (variants && variants.length > 0) {
      finalStock = variants.reduce((total: number, v: any) => total + Number(v.stock), 0);
    }

    const payload: any = {
      title_ar: title.ar,
      title_fr: title.fr || title.ar,
      sku: finalSku,
      barcode: finalBarcode,
      price: Number(price || (variants && variants[0]?.price) || 0),
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
      stock: finalStock,
      category_id: categoryDoc?.id || null,
      slug: generatedSlug,
      description_ar: description?.ar || "وصف منتج BioZad الطبيعي والفاخر من قلب المغرب.",
      description_fr: description?.fr || "Description premium du produit BioZad.",
      images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500"],
      is_featured: !!isFeatured,
      is_bundle: !!isBundle,
      updated_at: new Date().toISOString(),
    };

    let targetProductId = _id;

    if (_id) {
      const { error: updateError } = await supabase
        .from("products")
        .update(payload)
        .eq("id", _id);
      if (updateError) throw updateError;
    } else {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .or(`sku.eq.${finalSku},barcode.eq.${finalBarcode}`)
        .maybeSingle();

      if (existing) {
        return { success: false, message: "عذراً، رمز الـ SKU أو الباركود مكرر ومستخدم في منتج آخر!" };
      }

      const { data: created, error: insertError } = await supabase
        .from("products")
        .insert(payload)
        .select("id")
        .single();
      if (insertError) throw insertError;
      targetProductId = created.id;
    }

    // حفظ وتحديث الأوزان والمتغيرات
    if (variants && variants.length > 0) {
      await supabase.from("product_variants").delete().eq("product_id", targetProductId);
      const variantsPayload = variants.map((v: any) => ({
        product_id: targetProductId,
        sku: v.sku,
        barcode: v.barcode,
        weight: v.weight,
        price: Number(v.price),
        compare_at_price: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        stock: Number(v.stock),
      }));
      await supabase.from("product_variants").insert(variantsPayload);
    }

    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save product:", error);
    return { success: false, message: `فشل الحفظ: ${error.message}` };
  }
}

// 3. حذف المنتج
export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true, message: "تم حذف المنتج بنجاح!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}