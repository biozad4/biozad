/**
 * أدوات توليد روابط ورسائل الواتساب الأوتوماتيكية لطلبيات BioZad
 */

export const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212602732533";

/**
 * تنظيف وتنسيق رقم الهاتف ليتوافق مع المعيار الدولي للواتساب
 * تحويل 0612345678 أو 0712345678 إلى 212612345678
 */
export function normalizeWhatsAppPhone(phone?: string): string {
  if (!phone || !phone.trim()) return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
  let clean = phone.replace(/[^0-9+]/g, "").trim();

  if (clean.startsWith("+")) {
    clean = clean.substring(1);
  }

  // إذا كان الرقم مغربياً يبدأ بـ 06 أو 07 أو 05
  if (clean.startsWith("0") && clean.length === 10) {
    clean = "212" + clean.substring(1);
  }

  return clean || (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER);
}

export interface OrderWhatsAppDetails {
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address?: string;
  notes?: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

/**
 * إنشاء نص رسالة الطلب المنسقة باحترافية
 */
export function formatOrderWhatsAppMessage(order: OrderWhatsAppDetails): string {
  const itemsText = (order.items || [])
    .map((item) => `   ▫️ ${item.title} (x${item.quantity}) - ${item.price * item.quantity} د.م.`)
    .join("\n");

  const notesText = order.notes && order.notes.trim() ? `\n📝 *ملاحظات الزبون:* ${order.notes.trim()}` : "";

  return (
    `🌿 *طلب جديد من متجر BioZad*\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *رقم الطلب:* #${order.orderNumber}\n` +
    `👤 *اسم الزبون:* ${order.customerName}\n` +
    `📱 *رقم الهاتف:* ${order.phone}\n` +
    `📍 *المدينة:* ${order.city}\n` +
    `🏠 *العنوان:* ${order.address || "غير محدد"}${notesText}\n\n` +
    `🛍️ *المنتجات المطلوبة:*\n` +
    `${itemsText}\n\n` +
    `💰 *المبلغ الإجمالي عند الاستلام:* *${order.total} درهم* (الدفع نقداً بعد المعاينة)\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `أرجو تأكيد الشحن والتسليم، شكراً لكم.`
  );
}

/**
 * رابط فتح الواتساب للزبون مع رسالة الطلب موجهة لصاحب المتجر
 */
export function getWhatsAppOrderUrl(
  order: OrderWhatsAppDetails,
  storeWhatsAppNumber?: string
): string {
  const storePhone = normalizeWhatsAppPhone(storeWhatsAppNumber || DEFAULT_WHATSAPP_NUMBER);
  const message = formatOrderWhatsAppMessage(order);
  return `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;
}

/**
 * رابط تواصل سريع من لوحة تحكم الأدمن مع الزبون لتأكيد الشحن
 */
export function getAdminToCustomerWhatsAppUrl(
  customerPhone: string,
  customerName: string,
  orderNumber: string
): string {
  const targetPhone = normalizeWhatsAppPhone(customerPhone);
  const message =
    `السلام عليكم ${customerName || "أخي/أختي الكريم(ة)"}،\n` +
    `نتواصل معك من خدمة عملاء متجر *BioZad* بخصوص طلبيتك رقم *#${orderNumber}*.\n` +
    `نود تأكيد عنوان التوصيل معك لإرسال طردك في أسرع وقت.`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * فتح الرابط بأمان في نافذة جديدة
 */
export function openWhatsApp(url: string) {
  if (typeof window !== "undefined") {
    // فتح نافذة الواتساب
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
