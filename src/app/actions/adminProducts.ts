"use server";

import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { revalidatePath } from "next/cache";

// 1. جلب كافة المنتجات للإدارة
export async function getAdminProducts() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return { success: true, products: JSON.parse(JSON.stringify(products)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 2. إضافة منتج جديد أو تعديل منتج حالي مع الأوزان والوصف والصور
// 2. إضافة منتج جديد أو تعديل منتج حالي مع الأوزان والوصف والصور (النسخة المحدثة والمحمية)
export async function upsertProduct(data: any) {
  try {
    await connectDB();

    const { 
      _id, title, sku, barcode, price, compareAtPrice, stock, 
      category, description, images, variants, isFeatured, isBundle 
    } = data;

    // 💡 تصحيح ذكي: إذا كان المنتج يحتوي على أوزان، نعتمد معرّفات أول وزن كمعرّفات أساسية للمنتج لتفادي فراغ الحقول
    let finalSku = sku;
    let finalBarcode = barcode;

    if (variants && variants.length > 0) {
      if (!finalSku) finalSku = variants[0].sku;
      if (!finalBarcode) finalBarcode = variants[0].barcode;
    }

    // التحقق من الحقول الأساسية بعد التصحيح الذكي
    if (!title.ar || !finalSku || !finalBarcode || !category) {
      return { success: false, message: "الرجاء تعبئة كافة الحقول الأساسية المطلوبة" };
    }

    // حل معرّف القسم تلقائياً
    let categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc) {
      const fallbackNames: Record<string, { ar: string; fr: string }> = {
        amlou: { ar: "أملو الفاخر", fr: "Amlou" },
        tea: { ar: "الشاي المغربي", fr: "Thé" },
        bundles: { ar: "الباقات", fr: "Coffrets" },
        offers: { ar: "العروض", fr: "Offres" },
        furniture: { ar: "الأثاث التقليدي", fr: "Artisanat" }
      };
      const names = fallbackNames[category] || { ar: category, fr: category };
      categoryDoc = await Category.create({ slug: category, name: names, isActive: true });
    }

    // توليد الـ Slug الفريد
    const rawSlugSource = title.fr || title.ar || "product";
    const cleanSlug = rawSlugSource
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const generatedSlug = `${cleanSlug}-${finalSku.toLowerCase()}`;

    // حساب إجمالي الكمية بالمخزن من مجموع الأوزان في حال وجودها
    let finalStock = Number(stock);
    if (variants && variants.length > 0) {
      finalStock = variants.reduce((total: number, v: any) => total + Number(v.stock), 0);
    }

    const payload: any = {
      title,
      sku: finalSku,
      barcode: finalBarcode,
      price: Number(price || (variants && variants[0]?.price) || 0),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: finalStock,
      category: categoryDoc._id,
      slug: generatedSlug,
      description: {
        ar: description?.ar || "وصف منتج BioZad الطبيعي والفاخر من قلب المغرب.",
        fr: description?.fr || "Description premium du produit BioZad."
      },
      images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500"],
      isFeatured: !!isFeatured,
      isBundle: !!isBundle,
      // معالجة وحفظ مصفوفة الأوزان المتنوعة بدقة
      variants: variants && variants.length > 0 ? variants.map((v: any) => ({
        sku: v.sku,
        barcode: v.barcode,
        weight: v.weight,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        stock: Number(v.stock),
      })) : [],
    };

    let savedProduct;
    if (_id) {
      savedProduct = await Product.findByIdAndUpdate(_id, payload, { new: true });
    } else {
      // التحقق من عدم تكرار الباركود أو الـ SKU الأساسي قبل الإنشاء
      const existing = await Product.findOne({ $or: [{ sku: finalSku }, { barcode: finalBarcode }] });
      if (existing) {
        return { success: false, message: "عذراً، رمز الـ SKU أو الباركود مكرر ومستخدم في منتج آخر!" };
      }
      savedProduct = await Product.create(payload);
    }

    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true, product: JSON.parse(JSON.stringify(savedProduct)) };
  } catch (error: any) {
    console.error("Failed to save product:", error);
    return { success: false, message: `فشل الحفظ: ${error.message}` };
  }
}

// 3. حذف المنتج نهائياً من النظام
export async function deleteProduct(id: string) {
  try {
    await connectDB();
    await Product.findByIdAndDelete(id);
    revalidatePath("/shop");
    revalidatePath("/");
    return { success: true, message: "تم حذف المنتج بنجاح!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}