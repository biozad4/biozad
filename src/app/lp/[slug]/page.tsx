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
      <LandingPageView page={page} whatsappNumber={whatsappNumber} />
    </>
  );
}