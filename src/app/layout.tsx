import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { CartDrawer } from "@/components/shared/CartDrawer";
import { SessionProvider } from "next-auth/react";
import { PremiumToast } from "@/components/ui/premium-toast";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "BioZad | منتجات مغربية طبيعية فاخرة",
  description: "المتجر الرسمي لمنتجات BioZad من زيوت طبيعية وأملو وعسل حر مستخلص بنقاء 100%.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="antialiased bg-background text-foreground transition-colors duration-300 min-h-screen flex flex-col">
        {/* تغليف كامل للموقع لتمرير بيانات الجلسة بأمان */}
        <SessionProvider>
          <Header />
          <CartDrawer />
          <PremiumToast />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}