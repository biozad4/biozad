"use client";

import React, { useEffect, useState } from "react";
import { getAdminStats } from "@/app/actions/admin";
import { PremiumCard } from "../ui/premium-card";
import { PremiumSkeleton } from "../ui/premium-skeleton";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { DollarSign, ShoppingCart, Users, AlertTriangle, ArrowUpRight } from "lucide-react";

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      const res = await getAdminStats();
      if (res.success) {
        setData(res.stats);
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <PremiumSkeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <PremiumSkeleton className="h-[350px] w-full rounded-2xl" />
      </div>
    );
  }

  const kpis = [
    {
      title: "إجمالي المبيعات / Chiffre d'Affaires",
      value: `${data?.totalRevenue?.toLocaleString()} د.م.`,
      desc: "صافي الأرباح المحققة بعد الخصم",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      title: "الطلبيات المستلمة / Commandes",
      value: data?.totalOrders,
      desc: "إجمالي العمليات عبر الموقع والـ POS",
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "العملاء المسجلون / Clients",
      value: data?.totalCustomers,
      desc: "المشترون النشطون في قاعدة البيانات",
      icon: Users,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20",
    },
    {
      title: "تحذيرات المخزون / Alertes Stock",
      value: data?.lowStockCount,
      desc: "منتجات أوشكت كميتها على النفاد",
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/20",
    },
  ];

  return (
    <div className="space-y-8 p-6 md:p-8">
      
      {/* عنوان لوحة التحكم والترحيب */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">
            مرحباً بك في لوحة تحكم BioZad
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            متابعة دقيقة وفورية لحجم المبيعات والمخزون الموحد.
          </p>
        </div>
      </div>

      {/* كروت المؤشرات الأساسية (KPI Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <PremiumCard key={idx} hoverEffect={true} className="flex items-center justify-between p-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
                {kpi.title}
              </span>
              <h3 className="text-2xl font-serif font-extrabold text-neutral-800 dark:text-neutral-100">
                {kpi.value}
              </h3>
              <p className="text-[10px] text-neutral-500">{kpi.desc}</p>
            </div>
            <div className={`p-3 rounded-xl ${kpi.color}`}>
              <kpi.icon className="h-6 w-6" />
            </div>
          </PremiumCard>
        ))}
      </div>

      {/* الرسم البياني التفاعلي للمبيعات (Recharts Area Chart) */}
      <PremiumCard hoverEffect={false} className="p-6">
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-6">
          مخطط الأداء العام وحجم الإيرادات الشهرية (درهم مغربي)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
              <XAxis dataKey="name" stroke="#A3A3A3" fontSize={11} tickLine={false} />
              <YAxis stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  borderRadius: "12px", 
                  border: "1px solid #E5E5E5",
                  fontFamily: "inherit"
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* تفاصيل البيانات: المنتجات منخفضة المخزون والطلبيات الأخيرة جنباً إلى جنب */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* جدول الطلبيات الأخيرة */}
        <PremiumCard hoverEffect={false} className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <h3 className="text-sm font-bold">آخر الطلبيات المسجلة / Commandes Récentes</h3>
            <ArrowUpRight className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {data?.recentOrders?.map((order: any) => (
              <div key={order._id} className="flex justify-between items-center py-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-primary dark:text-accent">{order.orderNumber}</span>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{order.guestDetails?.name || "عميل POS"}</p>
                </div>
                <div className="text-end">
                  <span className="font-bold">{order.total} د.م.</span>
                  <span className={`block text-[9px] font-semibold uppercase mt-1 px-2 py-0.5 rounded-full ${
                    order.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>

        {/* المنتجات منخفضة المخزون ونقاط التحذير */}
        <PremiumCard hoverEffect={false} className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-900 pb-3">
            <h3 className="text-sm font-bold text-rose-600">تنبيهات قرب نفاد المخزون / Alerte de Rupture</h3>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {data?.lowStockProducts?.map((prod: any) => (
              <div key={prod._id} className="flex justify-between items-center py-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-100">{prod.title.ar}</span>
                  <p className="text-[10px] text-neutral-400">SKU: {prod.sku}</p>
                </div>
                <span className="rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 px-2.5 py-1 font-bold">
                  {prod.stock} وحدة متوفرة
                </span>
              </div>
            ))}
            {data?.lowStockProducts?.length === 0 && (
              <p className="text-center text-xs text-neutral-400 py-6">ممتاز! لا يوجد أي منتج منخفض المخزون حالياً.</p>
            )}
          </div>
        </PremiumCard>

      </div>

    </div>
  );
}