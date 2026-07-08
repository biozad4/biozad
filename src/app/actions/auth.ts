"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, "الاسم الكامل مطلوب (أكثر من 3 أحرف)"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
  phone: z.string().optional(),
});

export async function registerUser(rawData: any) {
  try {
    // 1. محاولة الاتصال بقاعدة البيانات
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error("Database connection failed in registration:", dbError);
      return { success: false, message: `فشل الاتصال بقاعدة البيانات: ${dbError.message || "تأكد من تشغيل MongoDB"}` };
    }

    // 2. التحقق من المدخلات عبر Zod
    const validation = registerSchema.safeParse(rawData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const firstErrorMsg = Object.values(fieldErrors)[0]?.[0] || "بيانات الإدخال غير صالحة";
      return { success: false, message: firstErrorMsg };
    }

    const { name, email, password, phone } = validation.data;

    // 3. التحقق من وجود الحساب مسبقاً
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return { success: false, message: "هذا البريد الإلكتروني مسجل بالفعل لدينا." };
    }

    // 4. تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. حفظ العميل الجديد
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: "customer",
      loyaltyPoints: 50, 
    });

    return { 
      success: true, 
      user: { id: newUser._id.toString(), name: newUser.name, points: newUser.loyaltyPoints } 
    };
  } catch (error: any) {
    console.error("User registration error details:", error);
    // إرجاع رسالة الخطأ الحقيقية للمستخدم لتسهيل التشخيص الفوري
    return { success: false, message: `فشل إنشاء الحساب: ${error.message || "خطأ مجهول"}` };
  }
}