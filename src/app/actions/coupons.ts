"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

function mapCoupon(c: any) {
  if (!c) return null;
  return {
    _id: c.id,
    id: c.id,
    code: c.code,
    discountType: c.discount_type,
    discountValue: Number(c.discount_value),
    appliesToType: c.applies_to_type,
    targetCategoryId: c.target_category_id,
    targetProductId: c.target_product_id,
    targetWeight: c.target_weight,
    isActive: c.is_active,
    expirationDate: c.expiration_date,
    createdAt: c.created_at,
  };
}

// 1. جلب كافة الكوبونات
export async function getAdminCoupons() {
  try {
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, coupons: (coupons || []).map(mapCoupon) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 2. إنشاء كوبون خصم جديد موجه
export async function createAdminCoupon(data: any) {
  try {
    const { code, discountType, discountValue, appliesToType, targetCategoryId, targetProductId, targetWeight } = data;

    if (!code || !discountType || !discountValue) {
      return { success: false, message: "يرجى ملء البيانات الأساسية للكوبون" };
    }

    const upperCode = code.toUpperCase().trim();

    const { data: existing } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", upperCode)
      .maybeSingle();

    if (existing) {
      return { success: false, message: "كود الخصم هذا مكرر وموجود بالفعل مسبقاً!" };
    }

    const { data: newCoupon, error } = await supabase
      .from("coupons")
      .insert({
        code: upperCode,
        discount_type: discountType,
        discount_value: Number(discountValue),
        applies_to_type: appliesToType || "all",
        target_category_id: targetCategoryId || null,
        target_product_id: targetProductId || null,
        target_weight: targetWeight || null,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin");
    return { success: true, coupon: mapCoupon(newCoupon) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 3. حذف كوبون خصم
export async function deleteAdminCoupon(id: string) {
  try {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin");
    return { success: true, message: "تم حذف كوبون الخصم بنجاح!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 4. التحقق من صلاحية الكوبون للزبون
export async function validateCouponCode(code: string) {
  try {
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !coupon) {
      return { success: false, message: "كود الخصم غير موجود أو غير فعال" };
    }
    return { success: true, coupon: mapCoupon(coupon) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}