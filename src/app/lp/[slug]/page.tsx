import { getLandingPageBySlug } from "@/app/actions/landing";
import { getStoreSettings } from "@/app/actions/storeSettings";
import { notFound } from "next/navigation";
import { LandingPageView } from "@/components/customer/LandingPageView";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  if (!page) {
    return {
      title: "الصفحة غير موجودة | BioZad",
    };
  }

  const seo = page.seo || {};
  const hero = page.hero || {};
  const firstImage = Array.isArray(hero.images) && hero.images.length > 0 ? hero.images[0] : "";

  return {
    title: seo.title || page.title || "BioZad | عرض خاص وحصري",
    description: seo.description || hero.subtitle?.ar || "عرض حصري مع توصيل مجاني ودفع عند الاستلام من BioZad.",
    openGraph: {
      title: seo.title || page.title,
      description: seo.description || hero.subtitle?.ar,
      images: firstImage ? [{ url: firstImage }] : [],
    },
  };
}

export default async function LandingPageDynamicRoute({ params }: PageProps) {
  const { slug } = await params;
  const [page, settingsRes] = await Promise.all([
    getLandingPageBySlug(slug),
    getStoreSettings(),
  ]);

  if (!page || (!page.isActive && process.env.NODE_ENV === "production")) {
    notFound();
  }

  const whatsappNumber = settingsRes.success && settingsRes.settings?.whatsappNumber
    ? settingsRes.settings.whatsappNumber
    : "212602732533";

  const pixelId = page.hero?.facebookPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";
  const tiktokPixelId = page.hero?.tiktokPixelId || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "";

  return (
    <>
      {/* سكريبت فيسبوك بيكسل القياسي المباشر في رأس الصفحة */}
      {pixelId && (
        <>
          <script
            id="facebook-pixel-inline"
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
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* سكريبت TikTok Pixel المباشر */}
      {tiktokPixelId && (
        <script
          id="tiktok-pixel-inline"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src=r+"?sdkid="+e+"&lib="+t;var c=document.getElementsByTagName("script")[0];c.parentNode.insertBefore(a,c)};
                ttq.load('${tiktokPixelId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}
      <LandingPageView page={page} whatsappNumber={whatsappNumber} />
    </>
  );
}