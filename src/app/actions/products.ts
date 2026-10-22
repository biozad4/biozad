"use server";

import { supabase } from "@/lib/supabase";

interface FilterParams {
  categorySlug?: string;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest";
  minPrice?: number;
  maxPrice?: number;
}

function mapProduct(p: any) {
  if (!p) return null;
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
    videos: p.videos || [],
    slug: p.slug,
    isActive: p.is_active,
    isFeatured: p.is_featured,
    isBundle: p.is_bundle,
    averageRating: Number(p.average_rating || 0),
    reviewsCount: Number(p.reviews_count || 0),
    category: p.categories ? {
      _id: p.categories.id,
      id: p.categories.id,
      slug: p.categories.slug,
      name: { ar: p.categories.name_ar, fr: p.categories.name_fr }
    } : null,
    variants: (p.product_variants || []).map((v: any) => ({
      _id: v.id,
      sku: v.sku,
      barcode: v.barcode,
      weight: v.weight,
      price: Number(v.price),
      compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
      stock: v.stock,
    })),
  };
}

export async function getFilteredProducts(params: FilterParams) {
  try {
    let query = supabase
      .from("products")
      .select("*, categories(*), product_variants(*)")
      .eq("is_active", true);

    // 1. تصفية حسب القسم
    if (params.categorySlug) {
      if (params.categorySlug === "other") {
        const mainSlugs = ["natural-honey", "amlou", "argan-oils", "tea", "offers", "remedies", "perfumes"];
        const { data: otherCats } = await supabase
          .from("categories")
          .select("id")
          .not("slug", "in", `(${mainSlugs.join(",")})`);
        
        if (otherCats && otherCats.length > 0) {
          query = query.in("category_id", otherCats.map(c => c.id));
        }
      } else {
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", params.categorySlug)
          .maybeSingle();

        if (category) {
          query = query.eq("category_id", category.id);
        } else {
          return [];
        }
      }
    }

    // 2. تصفية حسب البحث
    if (params.search) {
      const s = params.search.trim();
      query = query.or(`title_ar.ilike.%${s}%,title_fr.ilike.%${s}%,sku.ilike.%${s}%,barcode.ilike.%${s}%`);
    }

    // 3. تصفية حسب السعر
    if (params.minPrice !== undefined) {
      query = query.gte("price", params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      query = query.lte("price", params.maxPrice);
    }

    // 4. الترتيب
    if (params.sortBy === "price_asc") {
      query = query.order("price", { ascending: true });
    } else if (params.sortBy === "price_desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Supabase products query error:", error);
      return [];
    }

    return (products || []).map(mapProduct);
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*, categories(*), product_variants(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !product) return null;
    return mapProduct(product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}