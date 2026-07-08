"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function createInitialAdmin() {
  try {
    await connectDB();

    const adminEmail = "admin@biozad.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      return { success: false, message: "حساب الآدمن موجود بالفعل في قاعدة البيانات!" };
    }

    // تشفير كلمة المرور الخاصة بالآدمن
    const passwordHash = await bcrypt.hash("BiozadAdmin2026", 10);

    // إنشاء حساب الآدمن مع رول admin
    await User.create({
      name: "المدير العام BioZad",
      email: adminEmail,
      passwordHash,
      role: "admin",
      loyaltyPoints: 1000, // نقاط ولاء إضافية
    });

    return { 
      success: true, 
      message: "✓ تم إنشاء حساب المسؤول الأول بنجاح!",
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