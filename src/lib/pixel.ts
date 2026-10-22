export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * تسجيل مشاهدة الصفحة تلقائياً في Facebook Pixel
 */
export function pageview() {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

/**
 * إرسال حدث قياسي لـ Facebook Pixel
 */
export function trackEvent(name: string, options: Record<string, any> = {}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", name, options);
  }
}

/**
 * إرسال حدث مخصص (Custom Event)
 */
export function trackCustomEvent(name: string, options: Record<string, any> = {}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", name, options);
  }
}

/**
 * حدث مشاهدة محتوى منتج أو صفحة هبوط (ViewContent)
 */
export function trackViewContent(contentName: string, value?: number, currency = "MAD", extra: Record<string, any> = {}) {
  trackEvent("ViewContent", {
    content_name: contentName,
    value: value || 0,
    currency,
    ...extra,
  });
}

/**
 * حدث بدء إتمام الطلب عند اختيار العرض أو النقر على اطلب الآن (InitiateCheckout)
 */
export function trackInitiateCheckout(contentName: string, value?: number, currency = "MAD", extra: Record<string, any> = {}) {
  trackEvent("InitiateCheckout", {
    content_name: contentName,
    value: value || 0,
    currency,
    ...extra,
  });
}

/**
 * حدث تأكيد الشراء بنجاح (Purchase) - الأهم لحملات المبيعات
 */
export function trackPurchase(value: number, currency = "MAD", extra: Record<string, any> = {}) {
  trackEvent("Purchase", {
    value,
    currency,
    ...extra,
  });
}

/**
 * حدث تسجيل ليد أو طلب COD جديد (Lead)
 */
export function trackLead(value?: number, currency = "MAD", extra: Record<string, any> = {}) {
  trackEvent("Lead", {
    value: value || 0,
    currency,
    ...extra,
  });
}
