"use client";

import React, { useEffect, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import * as pixel from "@/lib/pixel";

interface FacebookPixelProps {
  pixelId?: string;
}

function FacebookPixelTracker({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePixelId = pixelId || pixel.FB_PIXEL_ID;

  useEffect(() => {
    if (!activePixelId) return;
    pixel.pageview();
  }, [pathname, searchParams, activePixelId]);

  return null;
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const activePixelId = pixelId || pixel.FB_PIXEL_ID;

  if (!activePixelId) {
    return null;
  }

  return (
    <>
      <Script
        id={`facebook-pixel-${activePixelId}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${activePixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${activePixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <FacebookPixelTracker pixelId={activePixelId} />
      </Suspense>
    </>
  );
}
