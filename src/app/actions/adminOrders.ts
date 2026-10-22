"use server";

import { supabase, query as pgQuery } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// 1. جلب كافة الطلبيات بجميع حالاتها
export async function getAdminOrders() {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*), users:customer_id(name, email)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = (orders || []).map((o: any) => ({
      _id: o.id,
      id: o.id,
      orderNumber: o.order_number,
      customer: o.users,
      guestDetails: o.guest_details,
      subtotal: Number(o.subtotal),
      shippingCost: Number(o.shipping_cost),
      discountAmount: Number(o.discount_amount),
      total: Number(o.total),
      source: o.source,
      paymentMethod: o.payment_method,
      status: o.status,
      items: (o.order_items || []).map((it: any) => ({
        _id: it.id,
        title: it.title,
        quantity: it.quantity,
        price: Number(it.price),
        variantSku: it.variant_sku,
        weight: it.weight,
      })),
      createdAt: o.created_at,
    }));

    return { success: true, orders: formatted };
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return { success: false, message: error.message };
  }
}

// 2. تحديث حالة الطلبية
export async function updateOrderStatus(orderId: string, newStatus: "pending" | "confirmed" | "preparing" | "shipping" | "delivered" | "cancelled" | "returned") {
  try {
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, status, subtotal, customer_id")
      .eq("id", orderId)
      .maybeSingle();

    if (findError || !order) {
      return { success: false, message: "لم يتم العثور على الطلبية المطلوبة" };
    }

    const previousStatus = order.status;

    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    // منح نقاط الولاء عند التوصيل لأول مرة
    if (newStatus === "delivered" && previousStatus !== "delivered" && order.customer_id) {
      const pointsEarned = Math.floor(Number(order.subtotal) / 10);
      if (pointsEarned > 0) {
        await pgQuery(
          "UPDATE users SET loyalty_points = loyalty_points + $1 WHERE id = $2",
          [pointsEarned, order.customer_id]
        );
      }
    }

    revalidatePath("/admin");
    return { 
      success: true, 
      message: `✓ تم تحديث حالة الطلب إلى "${newStatus}" بنجاح!`, 
      order: {
        _id: updated.id,
        ...updated,
      } 
    };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, message: error.message };
  }
}
