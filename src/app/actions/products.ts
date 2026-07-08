"use server";

import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";

interface FilterParams {
  categorySlug?: string;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest";
  minPrice?: number;
  maxPrice?: number;
}

export async function getFilteredProducts(params: FilterParams) {
  try {
    await connectDB();

    const query: any = { isActive: true };

    // تصفية حسب القسم
    if (params.categorySlug) {
      if (params.categorySlug === "other") {
        const mainSlugs = ["natural-honey", "amlou", "argan-oils", "tea", "offers", "remedies", "perfumes"];
        const otherCategories = await Category.find({ slug: { $nin: mainSlugs } }).lean();
        query.category = { $in: otherCategories.map((c: any) => c._id) };
      } else {
        const category = await Category.findOne({ slug: params.categorySlug });
        if (category) {
          query.category = category._id;
        }
      }
    }

    // تصفية حسب محرك البحث (Text Search)
    if (params.search) {
      query.$text = { $search: params.search };
    }

    // تصفية حسب النطاق السعري
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      query.price = {};
      if (params.minPrice !== undefined) query.price.$gte = params.minPrice;
      if (params.maxPrice !== undefined) query.price.$lte = params.maxPrice;
    }

    let sortOption: any = { createdAt: -1 }; // الافتراضي: الأحدث

    if (params.sortBy === "price_asc") {
      sortOption = { price: 1 };
    } else if (params.sortBy === "price_desc") {
      sortOption = { price: -1 };
    }

    // جلب البيانات مع الفلترة والترتيب
    const products = await Product.find(query)
      .sort(sortOption)
      .lean();

    // تحويل الكائنات لتكون متوافقة تماماً مع إرجاع واجهة المستخدم (التحويل لـ JSON نظيف)
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug, isActive: true }).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}