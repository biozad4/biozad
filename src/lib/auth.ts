import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        await connectDB();

        const { email, password } = credentials;
        if (!email || !password) return null;

        // البحث عن المستخدم ببريده الإلكتروني
        const user = await User.findOne({ email: (email as string).toLowerCase() });
        if (!user || !user.passwordHash) return null;

        // مطابقة كلمة المرور المشفرة
        const isPasswordMatch = await bcrypt.compare(password as string, user.passwordHash);
        if (!isPasswordMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});