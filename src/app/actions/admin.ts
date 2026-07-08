"use server";

import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

export async function getAdminStats() {
  try {
    await connectDB();

    // 1. حساب إجمالي الإيرادات من الطلبات غير الملغاة
    const revenueAggregation = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

    // 2. حساب إجمالي عدد الطلبات
    const totalOrders = await Order.countDocuments();

    // 3. حساب إجمالي عدد العملاء المسجلين
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // 4. جرد وتحديد المنتجات التي يقل مخزونها عن الحد الأدنى (Low Stock Alerts)
    const lowStockProducts = await Product.find({
      $or: [
        { stock: { $lte: 5 } }, // الحد الأدنى الافتراضي
        { "variants.stock": { $lte: 5 } }
      ]
    }).limit(5).lean();

    // 5. جلب آخر 5 طلبات تم تسجيلها في النظام للمتابعة السريعة
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 6. تجميع حجم المبيعات الشهرية لآخر 6 أشهر كبيانات للرسم البياني (Chart Data)
    const monthlySalesAggregation = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          sales: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    // صياغة بيانات الرسوم البيانية الافتراضية في حال كانت قاعدة البيانات حديثة
    const chartData = monthlySalesAggregation.length > 0 
      ? monthlySalesAggregation.map((item) => ({
          name: item._id,
          sales: item.sales,
          orders: item.count,
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
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
        lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
        chartData
      }
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return { success: false, message: "فشل استيراد بيانات لوحة التحكم" };
  }
}