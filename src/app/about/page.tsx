import React from "react";
import { PremiumCard } from "@/components/ui/premium-card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-accent uppercase tracking-widest">قصة نقاء وأصالة</span>
        <h1 className="font-serif text-4xl font-bold text-neutral-900 dark:text-white">حول BioZad</h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto text-sm leading-relaxed">
          تأسست BioZad لننقل لكِ أسرار الطبيعة المغربية الفاخرة بأعلى معايير الجودة والنقاء، مباشرة من حقول وجبال المغرب الأبي إلى بيتكِ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PremiumCard hoverEffect={false} className="p-6 space-y-3">
          <h3 className="font-serif text-lg font-bold text-primary">رؤيتنا الطبيعية</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            نلتزم بتقديم منتجات بكر وعضوية 100% بدون أي إضافات كيميائية، لنحافظ على النقاء الفطري لزيت الأركان، وأملو الفاخر، وعسل التيروار النادر.
          </p>
        </PremiumCard>

        <PremiumCard hoverEffect={false} className="p-6 space-y-3">
          <h3 className="font-serif text-lg font-bold text-primary">دعم التنمية المستدامة</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            نعمل بشراكة مباشرة مع التعاونيات النسائية المغربية التقليدية في الأطلس وسوس، لنضمن لهن عوائد عادلة تساهم في تمكينهن الاجتماعي وتطوير مجتمعاتهن المحلية.
          </p>
        </PremiumCard>
      </div>
    </div>
  );
}