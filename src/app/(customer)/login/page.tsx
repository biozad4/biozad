"use client";

import React, { useState } from "react";
import { registerUser } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { createInitialAdmin } from "@/app/actions/seed";
import { useToastStore } from "@/store/useToastStore";


export default function LoginPage() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { showToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async () => {
    const res = await createInitialAdmin();
    showToast(res.message, res.success ? "success" : "error");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (isRegisterMode) {
      // 1. تسجيل حساب جديد في النظام
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });

      if (res.success) {
        setSuccessMsg("تهانينا! تم إنشاء حسابك بنجاح وحصلت على 50 نقطة ترحيبية. جاري تسجيل الدخول...");
        
        // تسجيل الدخول التلقائي فور إنشاء الحساب
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(res.message || "فشل تسجيل الحساب الجديد.");
      }
    } else {
      // 2. تسجيل الدخول للحساب الحالي
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else {
        setSuccessMsg("تم تسجيل الدخول بنجاح! جاري توجيهك لصفحة المتجر...");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1200);
      }
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PremiumCard hoverEffect={false} className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-bold">
            {isRegisterMode ? "إنشاء حساب جديد في BioZad" : "مرحباً بعودتك إلى BioZad"}
          </h2>
          <p className="text-xs text-neutral-500">
            {isRegisterMode 
              ? "أنشئ حسابك اليوم واحصل على 50 نقطة ترحيبية مجاناً!" 
              : "سجل دخولك لمتابعة طلبياتك واستخدام رصيد نقاطك."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* حقل الاسم يظهر فقط عند إنشاء الحساب */}
          {isRegisterMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">الاسم الكامل</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-xl text-xs focus:ring-1"
                placeholder="أدخل اسمك الكامل"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-xl text-xs focus:ring-1 text-start"
              placeholder="example@mail.com"
            />
          </div>

          {isRegisterMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">رقم الهاتف (اختياري)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-xl text-xs focus:ring-1 text-start"
                placeholder="06XXXXXXXX"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">كلمة المرور</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-xl text-xs focus:ring-1"
              placeholder="******"
            />
          </div>

          <PremiumButton
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full py-3.5 text-xs font-bold shadow-premium-md"
          >
            {isRegisterMode ? "إنشاء حسابي والحصول على النقاط" : "تسجيل الدخول إلى حسابي"}
          </PremiumButton>
        </form>

        <div className="text-center pt-2 border-t text-xs">
          <button 
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-primary hover:underline font-bold"
          >
            {isRegisterMode ? "تملك حساباً بالفعل؟ سجل دخولك" : "ليس لديك حساب؟ أنشئ حسابك الآن"}
          </button>
        </div>
      </PremiumCard>
      <button 
  type="button"
  onClick={handleCreateAdmin}
  className="w-full mt-2 text-center text-xs text-primary underline"
>
  توليد حساب الآدمن الأول للتجربة (اضغط هنا مرة واحدة)
</button>
    </div>
  );
}