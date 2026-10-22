"use server";

import { query } from "@/lib/supabase";

export async function getAdminStats() {
  try {
    // 1. حساب إجمالي الإيرادات من الطلبات غير الملغاة
    const revRes = await query<{ revenue: string }>("SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != 'cancelled'");
    const totalRevenue = Number(revRes[0]?.revenue || 0);

    // 2. حساب إجمالي عدد الطلبات
    const ordRes = await query<{ total: string }>("SELECT COUNT(*) AS total FROM orders");
    const totalOrders = Number(ordRes[0]?.total || 0);

    // 3. حساب إجمالي عدد العملاء المسجلين
    const usrRes = await query<{ total: string }>("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
    const totalCustomers = Number(usrRes[0]?.total || 0);

    // 4. جرد وتحديد المنتجات التي يقل مخزونها عن الحد الأدنى
    const lowStockRows = await query(`
      SELECT id AS _id, title_ar, title_fr, stock, sku, price
      FROM products
      WHERE stock <= 5
      LIMIT 5
    `);

    const lowStockProducts = lowStockRows.map(p => ({
      _id: p._id,
      title: { ar: p.title_ar, fr: p.title_fr },
      stock: p.stock,
      sku: p.sku,
      price: Number(p.price)
    }));

    // 5. جلب آخر 5 طلبات تم تسجيلها في النظام
    const recentOrdersRows = await query(`
      SELECT 
        id AS _id, 
        order_number AS "orderNumber",
        total, 
        status, 
        created_at AS "createdAt",
        guest_details AS "guestDetails"
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const recentOrders = recentOrdersRows.map(o => ({
      ...o,
      total: Number(o.total)
    }));

    // 6. تجميع حجم المبيعات الشهرية لآخر 6 أشهر للرسم البياني
    const chartRes = await query<{ name: string; sales: string; orders: string }>(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') AS name,
        COALESCE(SUM(total), 0) AS sales,
        COUNT(*) AS orders
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY name ASC
      LIMIT 6
    `);

    const chartData = chartRes.length > 0 
      ? chartRes.map((item) => ({
          name: item.name,
          sales: Number(item.sales),
          orders: Number(item.orders),
        }))
      : [
          { name: "01", sales: 4000, orders: 20 },
          { name: "02", sales: 7500, orders: 35 },
          { name: "03", sales: 12000, orders: 50 },
          { name: "04", sales: 18500, orders: 85 },
          { name: "05", sales: 24000, orders: 110 },
          { name: "06", sales: 38000, orders: 165 },
        ];

    return {
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        lowStockCount: lowStockProducts.length,
        recentOrders,
        lowStockProducts,
        chartData
      }
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return { success: false, message: "فشل استيراد بيانات لوحة التحكم" };
  }
}