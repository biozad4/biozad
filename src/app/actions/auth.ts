"use server";

import { supabase } from "@/lib/supabase";
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
    const validation = registerSchema.safeParse(rawData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const firstErrorMsg = Object.values(fieldErrors)[0]?.[0] || "بيانات الإدخال غير صالحة";
      return { success: false, message: firstErrorMsg };
    }

    const { name, email, password, phone } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. التحقق من وجود الحساب مسبقاً
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      return { success: false, message: "هذا البريد الإلكتروني مسجل بالفعل لدينا." };
    }

    // 2. تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. حفظ العميل الجديد في Supabase
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        phone: phone || null,
        role: "customer",
        loyalty_points: 50,
      })
      .select("id, name, loyalty_points")
      .single();

    if (error || !newUser) {
      throw new Error(error?.message || "فشل تسجيل المستخدم في قاعدة البيانات");
    }

    return { 
      success: true, 
      user: { id: newUser.id, name: newUser.name, points: newUser.loyalty_points } 
    };
  } catch (error: any) {
    console.error("User registration error details:", error);
    return { success: false, message: `فشل إنشاء الحساب: ${error.message || "خطأ مجهول"}` };
  }
}