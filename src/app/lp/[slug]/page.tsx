import { getLandingPageBySlug } from "@/app/actions/landing";
import { notFound } from "next/navigation";
import { PremiumCard } from "@/components/ui/premium-card";
import { CheckoutForm } from "@/components/customer/CheckoutForm"; // ندرج السلة وإتمام الطلب مباشرة بالصفحة لتسهيل الشراء المباشر بنقرة واحدة!

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LandingPageView({ params }: PageProps) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  // إذا لم يعثر على الصفحة أو كانت غير نشطة، نعرض صفحة 404 الفاخرة
  if (!page) {
    notFound();
  }

  const hero = page.hero;

  return (
    <main className="bg-[#FAF9F6] dark:bg-neutral-950 min-h-screen text-neutral-900 dark:text-neutral-100">
      
      {/* 1. قسم البانر التسويقي الرئيسي (Hero Sales Section) */}
      <section className="relative py-20 lg:py-28 text-center px-4 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900">
        <div className="absolute top-1/2 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
        
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3.5 py-1 text-[10px] font-bold text-accent uppercase tracking-wider">
            عرض محدود وحصري اليوم
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-neutral-900 dark:text-white">
            {hero.title.ar}
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            {hero.subtitle.ar}
          </p>
          <div className="pt-4">
            <a href="#instant-order-panel" className="inline-block bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold rounded-full px-8 py-4 text-sm tracking-wide shadow-premium-md transition-all active:scale-95">
              {hero.ctaText.ar}
            </a>
          </div>
        </div>
      </section>

      {/* 2. أقسام المبيعات والمميزات المضافة (Dynamic Marketing Sections) */}
      <section className="py-16 max-w-4xl mx-auto px-4 space-y-10">
        {page.sections.map((section: any, idx: number) => (
          <PremiumCard key={idx} hoverEffect={false} className="p-8 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-primary dark:text-accent border-b pb-3 border-neutral-100 dark:border-neutral-900">
              {section.title?.ar}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </PremiumCard>
        ))}
      </section>

      {/* 3. صندوق التوصية الفوري والطلب بنقرة واحدة (Instant Order Section) */}
      <section id="instant-order-panel" className="bg-white dark:bg-neutral-900 py-16 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">تأكيد سريع ومضمون</span>
            <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">اطلبيه الآن خلال 30 ثانية</h2>
            <p className="text-xs text-neutral-500">يرجى ملء البيانات أدناه وسيتواصل معك موظفونا لتأكيد الشحن الفوري.</p>
          </div>

          {/* إعادة استخدام مكون الفاتورة التلقائي COD لإتمام المبيعات فورا */}
          <CheckoutForm />
        </div>
      </section>

    </main>
  );
}