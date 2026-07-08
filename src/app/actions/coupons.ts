"use server";

import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { revalidatePath } from "next/cache";

// 1. جلب كافة الكوبونات
export async function getAdminCoupons() {
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return { success: true, coupons: JSON.parse(JSON.stringify(coupons)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 2. إنشاء كوبون خصم جديد موجه
export async function createAdminCoupon(data: any) {
  try {
    await connectDB();

    const { code, discountType, discountValue, appliesToType, targetCategoryId, targetProductId, targetWeight } = data;

    if (!code || !discountType || !discountValue) {
      return { success: false, message: "يرجى ملء البيانات الأساسية للكوبون" };
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return { success: false, message: "كود الخصم هذا مكرر وموجود بالفعل مسبقاً!" };
    }

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      appliesToType,
      targetCategoryId: targetCategoryId || undefined,
      targetProductId: targetProductId || undefined,
      targetWeight: targetWeight || undefined,
    });

    revalidatePath("/admin");
    return { success: true, coupon: JSON.parse(JSON.stringify(newCoupon)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 3. حذف كوبون خصم
export async function deleteAdminCoupon(id: string) {
  try {
    await connectDB();
    await Coupon.findByIdAndDelete(id);
    revalidatePath("/admin");
    return { success: true, message: "تم حذف كوبون الخصم بنجاح!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 4. التحقق من صلاحية الكوبون للزبون
export async function validateCouponCode(code: string) {
  try {
    await connectDB();
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true }).lean();
    if (!coupon) {
      return { success: false, message: "كود الخصم غير موجود أو غير فعال" };
    }
    return { success: true, coupon: JSON.parse(JSON.stringify(coupon)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}