"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Coupon } from "@/models/Coupon";
import { auth } from "@/lib/auth";

export async function exchangePointsForCoupon() {
  try {
    await connectDB();

    // التحقق من جلسة العميل الحالي بأمان
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً للوصول للنقاط" };
    }

    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, message: "لم يتم العثور على حساب العميل" };
    }

    const POINTS_REQUIRED = 100; // تكلفة استبدال الكوبون بالنقاط
    const COUPON_VALUE = 50; // قيمة الخصم بالدرهم المغربي

    if (user.loyaltyPoints < POINTS_REQUIRED) {
      return { 
        success: false, 
        message: `نقاطك الحالية (${user.loyaltyPoints}) غير كافية. تحتاج إلى ${POINTS_REQUIRED} نقطة كحد أدنى.` 
      };
    }

    // خصم النقاط من حساب العميل وحفظ التحديث
    user.loyaltyPoints -= POINTS_REQUIRED;
    await user.save();

    // توليد رمز كوبون فريد غير قابل للتكرار
    const tokenCode = `BZ-LOYAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // حفظ قسيمة الشراء في قاعدة البيانات لتفعيلها عند الدفع
    const newCoupon = await Coupon.create({
      code: tokenCode,
      discountType: "fixed",
      discountValue: COUPON_VALUE,
      isActive: true,
      isLoyaltyReward: true,
      createdBy: user._id,
    });

    return {
      success: true,
      couponCode: tokenCode,
      discountValue: COUPON_VALUE,
      newPointsBalance: user.loyaltyPoints,
    };
  } catch (error) {
    console.error("Failed to exchange loyalty points:", error);
    return { success: false, message: "حدث خطأ غير متوقع أثناء المعالجة" };
  }
}

// جلب رصيد النقاط المحدث للعميل
export async function getUserPoints() {
  try {
    await connectDB();
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, points: 0 };
    }
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    return { success: true, points: user ? user.loyaltyPoints : 0 };
  } catch (error) {
    console.error("Failed to fetch user points:", error);
    return { success: false, points: 0 };
  }
}