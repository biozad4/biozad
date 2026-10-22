"use server";

import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function createInitialAdmin() {
  try {
    const adminEmail = "admin@biozad.com";
    const { data: existingAdmin } = await supabase
      .from("users")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();

    if (existingAdmin) {
      return { success: false, message: "حساب الآدمن موجود بالفعل في قاعدة البيانات!" };
    }

    // تشفير كلمة المرور الخاصة بالآدمن
    const passwordHash = await bcrypt.hash("BiozadAdmin2026", 10);

    // إنشاء حساب الآدمن مع رول admin
    const { error } = await supabase.from("users").insert({
      name: "المدير العام BioZad",
      email: adminEmail,
      password_hash: passwordHash,
      role: "admin",
      loyalty_points: 1000,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { 
      success: true, 
      message: "✓ تم إنشاء حساب المسؤول الأول بنجاح في Supabase!",
      credentials: {
        email: adminEmail,
        password: "BiozadAdmin2026"
      }
    };
  } catch (error: any) {
    console.error("Failed to seed admin:", error);
    return { success: false, message: `فشل إنشاء الآدمن: ${error.message}` };
  }
}