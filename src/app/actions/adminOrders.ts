"use server";

import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

// 1. جلب كافة الطلبيات بجميع حالاتها
export async function getAdminOrders() {
  try {
    await connectDB();
    const orders = await Order.find()
      .populate("items.product")
      .populate("cashier", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, orders: JSON.parse(JSON.stringify(orders)) };
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return { success: false, message: error.message };
  }
}

// 2. تحديث حالة الطلبية (تأكيد، ملغي، تم التوصيل، إلخ)
export async function updateOrderStatus(orderId: string, newStatus: "pending" | "confirmed" | "preparing" | "shipping" | "delivered" | "cancelled" | "returned") {
  try {
    await connectDB();
    
    // جلب الطلب للتحقق من حالته السابقة
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, message: "لم يتم العثور على الطلبية المطلوبة" };
    }

    const previousStatus = order.status;
    order.status = newStatus;
    const updated = await order.save();

    // منح نقاط الولاء فقط عند الانتقال إلى حالة "تم التوصيل" (delivered) لأول مرة
    if (newStatus === "delivered" && previousStatus !== "delivered" && order.customer) {
      const pointsEarned = Math.floor(order.subtotal / 10);
      if (pointsEarned > 0) {
        await User.findByIdAndUpdate(order.customer, { $inc: { loyaltyPoints: pointsEarned } });
      }
    }

    revalidatePath("/admin");
    return { 
      success: true, 
      message: `✓ تم تحديث حالة الطلب إلى "${newStatus}" بنجاح!`, 
      order: JSON.parse(JSON.stringify(updated)) 
    };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, message: error.message };
  }
}
