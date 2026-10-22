"use server";

import { supabase, query as pgQuery } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function exchangePointsForCoupon() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً للوصول للنقاط" };
    }

    const userId = (session.user as any).id;
    const { data: user } = await supabase
      .from("users")
      .select("id, loyalty_points")
      .eq("id", userId)
      .maybeSingle();

    if (!user) {
      return { success: false, message: "لم يتم العثور على حساب العميل" };
    }

    const POINTS_REQUIRED = 100;
    const COUPON_VALUE = 50;

    const currentPoints = user.loyalty_points || 0;
    if (currentPoints < POINTS_REQUIRED) {
      return { 
        success: false, 
        message: `نقاطك الحالية (${currentPoints}) غير كافية. تحتاج إلى ${POINTS_REQUIRED} نقطة كحد أدنى.` 
      };
    }

    // خصم النقاط
    const newPoints = currentPoints - POINTS_REQUIRED;
    await pgQuery("UPDATE users SET loyalty_points = $1 WHERE id = $2", [newPoints, userId]);

    // توليد رمز الكوبون
    const tokenCode = `BZ-LOYAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await supabase.from("coupons").insert({
      code: tokenCode,
      discount_type: "fixed",
      discount_value: COUPON_VALUE,
      applies_to_type: "all",
      is_active: true,
    });

    return {
      success: true,
      couponCode: tokenCode,
      discountValue: COUPON_VALUE,
      newPointsBalance: newPoints,
    };
  } catch (error) {
    console.error("Failed to exchange loyalty points:", error);
    return { success: false, message: "حدث خطأ غير متوقع أثناء المعالجة" };
  }
}

// جلب رصيد النقاط المحدث للعميل
export async function getUserPoints() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, points: 0 };
    }
    const userId = (session.user as any).id;
    const { data: user } = await supabase
      .from("users")
      .select("loyalty_points")
      .eq("id", userId)
      .maybeSingle();

    return { success: true, points: user ? user.loyalty_points : 0 };
  } catch (error) {
    console.error("Failed to fetch user points:", error);
    return { success: false, points: 0 };
  }
}