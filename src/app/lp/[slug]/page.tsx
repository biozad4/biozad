import { getLandingPageBySlug } from "@/app/actions/landing";
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
  const page = await getLandingPageBySlug(slug);

  if (!page || (!page.isActive && process.env.NODE_ENV === "production")) {
    notFound();
  }

  return <LandingPageView page={page} />;
}