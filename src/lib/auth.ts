import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        if (!email || !password) return null;

        const normalizedEmail = (email as string).toLowerCase().trim();

        // البحث عن المستخدم بجدول users في Supabase
        const { data: user, error } = await supabase
          .from("users")
          .select("id, name, email, password_hash, role")
          .eq("email", normalizedEmail)
          .single();

        if (error || !user || !user.password_hash) {
          return null;
        }

        // مطابقة كلمة المرور المشفرة
        const isPasswordMatch = await bcrypt.compare(password as string, user.password_hash);
        if (!isPasswordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});