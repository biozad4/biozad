export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";
export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
  }
}

/**
 * تسجيل مشاهدة الصفحة تلقائياً في Facebook Pixel و TikTok Pixel
 */
export function pageview() {
  if (typeof window !== "undefined") {
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
    if (typeof window.ttq === "object" && typeof window.ttq.page === "function") {
      window.ttq.page();
    }
  }
}

/**
 * إرسال حدث قياسي لـ Facebook Pixel و TikTok Pixel
 */
export function trackEvent(name: string, options: Record<string, any> = {}) {
  if (typeof window !== "undefined") {
    if (typeof window.fbq === "function") {
      window.fbq("track", name, options);
    }
    if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
      window.ttq.track(name, options);
    }
  }
}

/**
 * إرسال حدث مخصص (Custom Event)
 */
export function trackCustomEvent(name: string, options: Record<string, any> = {}) {
  if (typeof window !== "undefined") {
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", name, options);
    }
    if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
      window.ttq.track(name, options);
    }
  }
}

/**
 * حدث مشاهدة محتوى منتج أو صفحة هبوط (ViewContent)
 */
export function trackViewContent(contentName: string, value?: number, currency = "MAD", extra: Record<string, any> = {}) {
  const payload = {
    content_name: contentName,
    value: value || 0,
    currency,
    ...extra,
  };

  if (typeof window !== "undefined") {
    if (typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", payload);
    }
    if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
      window.ttq.track("ViewContent", {
        content_name: contentName,
        value: value || 0,
        currency,
      });
    }
  }
}

/**
 * حدث بدء إتمام الطلب عند اختيار العرض أو النقر على اطلب الآن (InitiateCheckout)
 */
export function trackInitiateCheckout(contentName: string, value?: number, currency = "MAD", extra: Record<string, any> = {}) {
  const payload = {
    content_name: contentName,
    value: value || 0,
    currency,
    ...extra,
  };

  if (typeof window !== "undefined") {
    if (typeof window.fbq === "function") {
      window.fbq("track", "InitiateCheckout", payload);
    }
    if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
      window.ttq.track("InitiateCheckout", {
        content_name: contentName,
        value: value || 0,
        currency,
      });
    }
  }
}

/**
 * حدث تأكيد الشراء بنجاح (Purchase / CompletePayment) - الأهم لحملات المبيعات
 */
export function trackPurchase(value: number, currency = "MAD", extra: Record<string, any> = {}) {
  const payload = {
    value,
    currency,
    ...extra,
  };

  if (typeof window !== "undefined") {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", payload);
    }
    if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
      window.ttq.track("CompletePayment", {
        value,
        currency,
        content_type: "product",
      });
    }
  }
}

/**
 * حدث تسجيل ليد أو طلب COD جديد (Lead / SubmitForm)
 */
export function trackLead(value?: number, currency = "MAD", extra: Record<string, any> = {}) {
  const payload = {
    value: value || 0,
    currency,
    ...extra,
  };

  if (typeof window !== "undefined") {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", payload);
    }
    if (typeof window.ttq === "object" && typeof window.ttq.track === "function") {
      window.ttq.track("SubmitForm", {
        value: value || 0,
        currency,
      });
    }
  }
}
