import React from "react";
import { getCustomBundleProducts } from "@/app/actions/featuredBundle";
import { CustomBundleBuilder } from "@/components/customer/CustomBundleBuilder";
import Link from "next/link";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "شكّل باقتك المخصصة | BioZad",
  description: "اختر منتجاتك المفضلة من عسل، أملو، وزيوت طبيعية واستفد من خصم فوري متصاعد يصل إلى 15%!",
};

export default async function CustomBundlePage() {
  const data = await getCustomBundleProducts();

  if (!data.success || !data.isEnabled || !data.settings) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-neutral-950 flex items-center justify-center px-4 py-24 text-center">
        <div className="max-w-md space-y-4 p-8 bg-white dark:bg-neutral-900 rounded-3xl border shadow-premium-md">
          <Package className="h-12 w-12 text-neutral-400 mx-auto" />
          <h2 className="text-xl font-serif font-black text-neutral-900 dark:text-white">
            ميزة تشكيل الباقة غير متاحة حالياً
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            يقوم فريقنا حالياً بتحديث تشكيلة الباقات والعروض الخاصة. يمكنك تصفح المنتجات الفردية أو العروض الجاهزة.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
            >
              تصفح متجر BioZad
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CustomBundleBuilder
      products={data.products}
      settings={data.settings}
    />
  );
}
