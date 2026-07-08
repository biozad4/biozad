import React from "react";
import { LayoutDashboard, ShoppingCart, Users, Package, Home, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      
      {/* الشريط الجانبي الفاخر للآدمن (Admin Sidebar) */}
      <aside className="w-64 border-r border-neutral-200 bg-white p-6 hidden md:flex flex-col justify-between">
        <div className="space-y-8">
          {/* لوغو العلامة الفاخر */}
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tight text-primary">BioZad</span>
            <span className="text-[9px] text-accent font-semibold uppercase tracking-widest -mt-1">لوحة تحكم الإدارة</span>
          </div>

          {/* روابط التنقل */}
          <nav className="space-y-1">
            <a href="/admin" className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-xs font-bold text-primary transition-all">
              <LayoutDashboard className="h-4 w-4 text-accent" />
              <span>لوحة التحكم الإحصائية</span>
            </a>
            <a href="/shop" className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-all">
              <Home className="h-4 w-4" />
              <span>العودة لمتجر الزبائن</span>
            </a>
          </nav>
        </div>

        <div className="border-t pt-4">
          <a href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all">
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </a>
        </div>
      </aside>

      {/* حيز العرض الرئيسي لصفحات الآدمن */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}