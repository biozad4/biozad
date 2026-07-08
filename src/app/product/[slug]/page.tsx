import { getProductBySlug } from "@/app/actions/products";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/customer/ProductDetails";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// توليد بيانات الميتا ديناميكياً لتحسين محركات البحث (SEO)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "المنتج غير موجود | BioZad",
    };
  }

  return {
    title: `${product.title.ar} | BioZad منتجات طبيعية فاخرة`,
    description: product.description.ar,
    openGraph: {
      title: product.title.ar,
      description: product.description.ar,
      images: [{ url: product.images[0] || "" }],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="bg-[#FAF9F6] dark:bg-neutral-950 min-h-screen">
      <ProductDetails product={product} />
    </main>
  );
}
