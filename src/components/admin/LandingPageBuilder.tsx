"use client";

import React, { useState } from "react";
import { saveLandingPage } from "@/app/actions/landing";
import { PremiumCard } from "../ui/premium-card";
import { PremiumButton } from "../ui/premium-button";
import { LayoutGrid, Eye, Plus, Save, Trash2, Settings } from "lucide-react";

export function LandingPageBuilder() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // الهيكل الافتراضي لصفحة هبوط جديدة
  const [pageData, setPageData] = useState<any>({
    title: "حملة زيت الأركان الطبيعي الفاخر",
    slug: "argan-luxury",
    isActive: true,
    hero: {
      title: { ar: "سر النقاء والجمال من قلب الأطلس", fr: "La pureté d'Argan de l'Atlas" },
      subtitle: { ar: "زيت أركان عضوي بكر ممتاز معصور على البارد بنقاء 100%", fr: "Huile d'Argan pure pressée à froid" },
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800",
      ctaText: { ar: "اطلبيه الآن واحصلي على توصيل مجاني", fr: "Commander maintenant" }
    },
    sections: [
      {
        type: "features",
        title: { ar: "لماذا تختارين منتجات BioZad؟", fr: "Pourquoi choisir BioZad ?" },
        content: "نقي وطبيعي 100% • خالي من المواد الكيميائية • مرخص من الجهات المختصة • مستخلص بوعي لدعم التعاونيات النسائية المحلية."
      }
    ],
    seo: {
      title: "BioZad | زيت الأركان العضوي الفاخر",
      description: "اكتشفي فوائد زيت الأركان الطبيعي المعصور على البارد لبشرة نضرة وشعر صحي.",
    }
  });

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await saveLandingPage(pageData);
    if (res.success) {
      setSuccessMsg("تم حفظ وتحديث صفحة الهبوط بنجاح! الرابط جاهز للترويج.");
      setPageData(res.page);
    } else {
      setErrorMsg(res.message || "حدث خطأ أثناء الحفظ.");
    }
    setLoading(false);
  };

  const addSection = (type: "features" | "products_grid" | "video_reviews" | "faq") => {
    const newSection = {
      type,
      title: { ar: "عنوان قسم جديد", fr: "Titre de section" },
      content: "أضف تفاصيل محتوى القسم هنا...",
      products: []
    };
    setPageData({
      ...pageData,
      sections: [...pageData.sections, newSection]
    });
  };

  const removeSection = (index: number) => {
    const updated = pageData.sections.filter((_: any, idx: number) => idx !== index);
    setPageData({ ...pageData, sections: updated });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* العناوين والتحكم بالتبويبات */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">منشئ صفحات الهبوط الذكي</h1>
          <p className="text-xs text-neutral-500 mt-1">تجهيز وإطلاق صفحات البيع المباشر والحملات التسويقية بسهولة تامة.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
              activeTab === "edit" ? "bg-primary text-white" : "bg-white text-neutral-600"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>تعديل البنية</span>
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
              activeTab === "preview" ? "bg-primary text-white" : "bg-white text-neutral-600"
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>معاينة حية</span>
          </button>
        </div>
      </div>

      {successMsg && <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">✓ {successMsg}</div>}
      {errorMsg && <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl">⚠️ {errorMsg}</div>}

      {/* حيز التحرير وبناء الصفحة */}
      {activeTab === "edit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* الإعدادات الأساسية والهيرو (7 أعمدة) */}
          <div className="lg:col-span-7 space-y-6">
            <PremiumCard hoverEffect={false} className="p-6 space-y-4">
              <h3 className="text-sm font-bold border-b pb-2 mb-4">الإعدادات العامة للرابط</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400">عنوان الصفحة الداخلي</label>
                  <input
                    type="text"
                    value={pageData.title}
                    onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                    className="w-full border rounded-xl p-3 text-xs focus:ring-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400">الرابط المخصص (biozad.com/lp/...)</label>
                  <input
                    type="text"
                    value={pageData.slug}
                    onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                    className="w-full border rounded-xl p-3 text-xs font-mono"
                  />
                </div>
              </div>
            </PremiumCard>

            <PremiumCard hoverEffect={false} className="p-6 space-y-4">
              <h3 className="text-sm font-bold border-b pb-2 mb-4">تجهيز واجهة البانر الرئيسي (Hero Segment)</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400">العنوان الجذاب (عربي)</label>
                  <input
                    type="text"
                    value={pageData.hero.title.ar}
                    onChange={(e) => setPageData({
                      ...pageData,
                      hero: { ...pageData.hero, title: { ...pageData.hero.title, ar: e.target.value } }
                    })}
                    className="w-full border rounded-xl p-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400">الوصف الفرعي والفوائد (عربي)</label>
                  <textarea
                    rows={2}
                    value={pageData.hero.subtitle.ar}
                    onChange={(e) => setPageData({
                      ...pageData,
                      hero: { ...pageData.hero, subtitle: { ...pageData.hero.subtitle, ar: e.target.value } }
                    })}
                    className="w-full border rounded-xl p-3 text-xs"
                  />
                </div>
              </div>
            </PremiumCard>

            {/* إدارة الأقسام الحركية المضافة */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span>أقسام الصفحة الحالية</span>
              </h3>

              {pageData.sections.map((sect: any, idx: number) => (
                <PremiumCard key={idx} hoverEffect={false} className="p-5 space-y-3 relative">
                  <button
                    onClick={() => removeSection(idx)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] font-bold bg-accent/10 text-accent px-2.5 py-1 rounded-full uppercase">
                    قسم: {sect.type}
                  </span>
                  <div className="space-y-2 mt-2">
                    <input
                      type="text"
                      value={sect.title.ar}
                      onChange={(e) => {
                        const updated = [...pageData.sections];
                        updated[idx].title.ar = e.target.value;
                        setPageData({ ...pageData, sections: updated });
                      }}
                      className="w-full border rounded-xl p-3 text-xs font-bold"
                      placeholder="عنوان القسم بالعربية"
                    />
                    <textarea
                      rows={2}
                      value={sect.content}
                      onChange={(e) => {
                        const updated = [...pageData.sections];
                        updated[idx].content = e.target.value;
                        setPageData({ ...pageData, sections: updated });
                      }}
                      className="w-full border rounded-xl p-3 text-xs"
                      placeholder="محتوى أو خصائص هذا القسم بالتفصيل..."
                    />
                  </div>
                </PremiumCard>
              ))}
            </div>
          </div>

          {/* لوحة إضافة الأقسام الجانبية وتأكيد الحفظ (5 أعمدة) */}
          <div className="lg:col-span-5 space-y-6">
            <PremiumCard hoverEffect={false} className="p-6 space-y-4">
              <h3 className="text-sm font-bold border-b pb-2">عناصر البناء السريعة</h3>
              <p className="text-[11px] text-neutral-500">اختر القسم الذي تريد إضافته لصفحة الهبوط وسيظهر فوراً في لوحة التحرير:</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => addSection("features")}
                  className="p-3 border rounded-xl hover:bg-neutral-50 text-xs font-semibold flex flex-col items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>المميزات والفوائد</span>
                </button>
                <button
                  onClick={() => addSection("products_grid")}
                  className="p-3 border rounded-xl hover:bg-neutral-50 text-xs font-semibold flex flex-col items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>سلة المنتجات الفورية</span>
                </button>
                <button
                  onClick={() => addSection("video_reviews")}
                  className="p-3 border rounded-xl hover:bg-neutral-50 text-xs font-semibold flex flex-col items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>مراجعات الفيديو</span>
                </button>
                <button
                  onClick={() => addSection("faq")}
                  className="p-3 border rounded-xl hover:bg-neutral-50 text-xs font-semibold flex flex-col items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>الأسئلة الشائعة FAQ</span>
                </button>
              </div>
            </PremiumCard>

            <PremiumCard hoverEffect={false} className="p-6 space-y-4">
              <h3 className="text-sm font-bold border-b pb-2">إعدادات محركات البحث للـ Landing Page</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400">SEO Meta Title</label>
                  <input
                    type="text"
                    value={pageData.seo.title}
                    onChange={(e) => setPageData({ ...pageData, seo: { ...pageData.seo, title: e.target.value } })}
                    className="w-full border rounded-xl p-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={pageData.seo.description}
                    onChange={(e) => setPageData({ ...pageData, seo: { ...pageData.seo, description: e.target.value } })}
                    className="w-full border rounded-xl p-3 text-xs"
                  />
                </div>
              </div>
            </PremiumCard>

            <PremiumButton
              onClick={handleSave}
              loading={loading}
              variant="primary"
              className="w-full py-4 text-base font-bold flex items-center justify-center gap-2 shadow-premium-md"
            >
              <Save className="h-5 w-5" />
              <span>نشر وتفعيل صفحة الهبوط الآن</span>
            </PremiumButton>
          </div>

        </div>
      ) : (
        // محاكاة سريعة ومبسطة للعرض النهائي للعميل (Live Preview Mode)
        <div className="border border-neutral-200 rounded-[2rem] overflow-hidden shadow-premium-lg bg-[#FAF9F6] max-w-4xl mx-auto">
          {/* بانر الهيرو في المعاينة */}
          <div className="p-12 text-center space-y-6 border-b bg-white">
            <span className="text-[10px] bg-accent/10 text-accent font-bold px-3 py-1 rounded-full uppercase">معاينة البانر الرئيسي</span>
            <h1 className="text-3xl font-serif font-bold text-neutral-900">{pageData.hero.title.ar}</h1>
            <p className="text-sm text-neutral-600 max-w-lg mx-auto">{pageData.hero.subtitle.ar}</p>
            <button className="bg-primary hover:bg-primary/95 text-white font-bold rounded-full px-8 py-3.5 text-sm shadow-premium-md">
              {pageData.hero.ctaText.ar}
            </button>
          </div>

          {/* محاكاة الأقسام المضافة */}
          <div className="p-8 space-y-6">
            {pageData.sections.map((sect: any, idx: number) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-neutral-100 space-y-2">
                <h3 className="font-serif font-bold text-lg text-primary">{sect.title.ar}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{sect.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}