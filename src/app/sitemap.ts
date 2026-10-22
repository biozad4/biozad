import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biozad.com";

  // 1. الصفحات الثابتة الأساسية للمتجر
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/honey`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/amlou`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/oils`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tea`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/perfumes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/remedies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/offers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/custom-bundle`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // 2. جلب جميع صفحات المنتجات الفردية النشطة ديناميكياً
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabase
      .from("products")
      .select("id, slug, updated_at")
      .limit(200);

    if (products) {
      productRoutes = products.map((p) => ({
        url: `${baseUrl}/product/${p.slug || p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Error generating product sitemap:", error);
  }

  // 3. جلب صفحات الهبوط الإعلانية النشطة
  let landingRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: landings } = await supabase
      .from("landing_pages")
      .select("slug, updated_at, is_active")
      .eq("is_active", true)
      .limit(100);

    if (landings) {
      landingRoutes = landings.map((lp) => ({
        url: `${baseUrl}/lp/${lp.slug}`,
        lastModified: lp.updated_at ? new Date(lp.updated_at) : new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error("Error generating landing pages sitemap:", error);
  }

  return [...staticRoutes, ...productRoutes, ...landingRoutes];
}
