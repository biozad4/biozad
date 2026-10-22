"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as pixel from "@/lib/pixel";

interface FacebookPixelProps {
  pixelId?: string;
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const activePixelId = pixelId || pixel.FB_PIXEL_ID;
  const pathname = usePathname();

  useEffect(() => {
    if (!activePixelId || typeof window === "undefined") return;

    // تهيئة دالة fbq في window إذا لم تكن موجودة
    if (!window.fbq) {
      const fbq: any = function (...args: any[]) {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, args);
        } else {
          fbq.queue.push(args);
        }
      };
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq;

      // حقن ملف fbevents.js الرسمي في رأس الصفحة
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }

    // تهيئة البيكسل وإرسال PageView
    try {
      window.fbq("init", activePixelId);
      window.fbq("track", "PageView");
    } catch (e) {
      console.warn("FB Pixel track error:", e);
    }
  }, [activePixelId, pathname]);

  if (!activePixelId) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${activePixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
