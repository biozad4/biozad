"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

function mapLandingPage(p: any) {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    slug: p.slug,
    title: p.title,
    isActive: p.is_active,
    hero: p.hero || {},
    sections: Array.isArray(p.sections) ? p.sections : [],
    seo: p.seo || {},
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// 1. جلب كافة صفحات الهبوط للوحة التحكم
export async function getLandingPages() {
  try {
    const { data: pages, error } = await supabase
      .from("landing_pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, pages: (pages || []).map(mapLandingPage) };
  } catch (error: any) {
    console.error("Failed to fetch landing pages:", error);
    return { success: false, message: error.message, pages: [] };
  }
}

// 2. جلب تفاصيل صفحة هبوط حسب الرابط (Slug)
export async function getLandingPageBySlug(slug: string) {
  try {
    const { data: page, error } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !page) return null;
    return mapLandingPage(page);
  } catch (error) {
    console.error("Failed to fetch landing page by slug:", error);
    return null;
  }
}

// 3. جلب تفاصيل صفحة هبوط حسب المعرف (ID)
export async function getLandingPageById(id: string) {
  try {
    const { data: page, error } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !page) return null;
    return mapLandingPage(page);
  } catch (error) {
    console.error("Failed to fetch landing page by id:", error);
    return null;
  }
}

// 4. حفظ أو تعديل صفحة هبوط
export async function saveLandingPage(data: any) {
  try {
    const { _id, id, slug, title, isActive, hero, sections, seo } = data;
    const targetId = _id || id;

    const cleanSlug = (slug || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (!cleanSlug) {
      return { success: false, message: "الرابط المخصص (Slug) مطلوب / Slug requis" };
    }

    const payload = {
      slug: cleanSlug,
      title: title || "صفحة هبوط جديدة",
      is_active: isActive !== false,
      hero: hero || {},
      sections: sections || [],
      seo: seo || {},
      updated_at: new Date().toISOString(),
    };

    if (targetId) {
      // التحقق من عدم تكرار الرابط مع صفحة أخرى
      const { data: duplicate } = await supabase
        .from("landing_pages")
        .select("id")
        .eq("slug", cleanSlug)
        .neq("id", targetId)
        .maybeSingle();

      if (duplicate) {
        return { success: false, message: "هذا الرابط المخصص مستخدم بالفعل في صفحة أخرى" };
      }

      const { data: updated, error } = await supabase
        .from("landing_pages")
        .update(payload)
        .eq("id", targetId)
        .select()
        .single();

      if (error) throw error;
      revalidatePath(`/lp/${cleanSlug}`);
      revalidatePath("/admin");
      return { success: true, message: "✓ تم تحديث صفحة الهبوط بنجاح!", page: mapLandingPage(updated) };
    } else {
      // صفحة جديدة: التحقق من الرابط
      const { data: existing } = await supabase
        .from("landing_pages")
        .select("id")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (existing) {
        return { success: false, message: "هذا الرابط المخصص مستخدم بالفعل في صفحة أخرى، اختر رابطاً مختلفاً" };
      }

      const { data: created, error } = await supabase
        .from("landing_pages")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      revalidatePath("/admin");
      return { success: true, message: "✓ تم إنشاء صفحة الهبوط بنجاح!", page: mapLandingPage(created) };
    }
  } catch (error: any) {
    console.error("Failed to save landing page:", error);
    return { success: false, message: `فشل حفظ صفحة الهبوط: ${error.message}` };
  }
}

// 5. حذف صفحة هبوط
export async function deleteLandingPage(id: string) {
  try {
    const { error } = await supabase
      .from("landing_pages")
      .delete()
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin");
    return { success: true, message: "✓ تم حذف صفحة الهبوط بنجاح!" };
  } catch (error: any) {
    console.error("Failed to delete landing page:", error);
    return { success: false, message: `فشل حذف الصفحة: ${error.message}` };
  }
}

// 6. تفعيل أو تعطيل صفحة هبوط بسرعة
export async function toggleLandingPageStatus(id: string, isActive: boolean) {
  try {
    const { error } = await supabase
      .from("landing_pages")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    revalidatePath("/admin");
    return { success: true, message: isActive ? "تم تفعيل الصفحة" : "تم تعطيل الصفحة" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// 7. تهيئة صفحة هبوط نموذجية احترافية تلقائياً
export async function seedSampleLandingPage() {
  try {
    // جلب أول منتج متاح
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    const productId = product ? product.id : "";
    const productTitle = product ? product.title_ar : "زيت أركان التجميلي البكر الممتاز";
    const productPrice = product ? Number(product.price) : 180;
    const productImages = product?.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1608248597359-bb5c68f2f254?auto=format&fit=crop&q=80&w=800"];

    const sampleData = {
      slug: "argan-gold",
      title: "حملة زيت الأركان المغربي الأصيل (Meta & TikTok Ads)",
      isActive: true,
      hero: {
        productId,
        productTitle,
        title: {
          ar: "سر النضارة والإشراقة الدائمة من قلب جبال الأطلس المغربي",
          fr: "Le Secret de l'Éclat Éternel de l'Atlas Marocain",
        },
        subtitle: {
          ar: "زيت أركان بيولوجي 100% معصور على البارد، غني بفيتامين E ومضادات الأكسدة لمحاربة التجاعيد وترميم البشرة والشعر التالف من أول أسبوع.",
          fr: "Huile d'Argan 100% pure et biologique, pressée à froid.",
        },
        badge: "🔥 العرض الأقوى هذا الأسبوع • خصم يصل إلى 40% + شحن مجاني",
        images: productImages,
        stockLeft: 9,
        countdownMinutes: 45,
        originalPrice: productPrice + 100,
        price: productPrice,
        ctaText: {
          ar: "اطلب الآن والدفع عند الاستلام بعد المعاينة",
          fr: "Commander Maintenant - Paiement à la Livraison",
        },
        facebookPixelId: "",
        offers: [
          {
            id: "offer-1",
            title: "عبوة واحدة (تجربة ممتازة)",
            quantity: 1,
            price: productPrice,
            compareAtPrice: productPrice + 70,
            freeShipping: false,
            badge: "سعر اقتصادي",
            isPopular: false,
          },
          {
            id: "offer-2",
            title: "عبوتان (العرض الأكثر طلباً ⭐)",
            quantity: 2,
            price: Math.round(productPrice * 1.7),
            compareAtPrice: (productPrice + 70) * 2,
            freeShipping: true,
            badge: "وفر 90 د.م + توصيل مجاني",
            isPopular: true,
          },
          {
            id: "offer-3",
            title: "3 عبوات (باقة العائلة التوفيرية)",
            quantity: 3,
            price: Math.round(productPrice * 2.3),
            compareAtPrice: (productPrice + 70) * 3,
            freeShipping: true,
            badge: "توصيل مجاني + صابونة طبيعية هدية",
            isPopular: false,
          },
        ],
        features: [
          {
            icon: "ShieldCheck",
            title: "طبيعي وأصلي 100%",
            text: "معصور على البارد بدون أي إضافات كيميائية أو مواد حافظة.",
          },
          {
            icon: "Truck",
            title: "توصيل سريع لباب منزلك",
            text: "شحن فوري خلال 24 إلى 48 ساعة لكافة المدن المغربية.",
          },
          {
            icon: "BadgeCheck",
            title: "الدفع بعد المعاينة",
            text: "افتح طردك وتأكد من جودة المنتج بنفسك قبل دفع أي درهم للموزع.",
          },
          {
            icon: "Award",
            title: "ضمان الرضا الذهبي",
            text: "إن لم تكن راضياً تماماً عن الجودة نضمن لك استرجاع أو استبدال فوري.",
          },
        ],
        reviews: [
          {
            name: "سارة التازي",
            city: "الرباط",
            rating: 5,
            comment: "صراحة جودة ولا أروع، الرائحة ديالو خفيفة وطبيعية والامتصاص سريع للبشرة، عجبني بزااف وغادي نعاود نطلب منه.",
            date: "منذ 3 أيام",
            verified: true,
          },
          {
            name: "محمد العلمي",
            city: "الدار البيضاء",
            rating: 5,
            comment: "التوصيل كان سريع جداً (جا ف 24 ساعة)، والسلعة أصلية ومطابقة للوصف. شكراً BioZad على المصداقية.",
            date: "منذ 5 أيام",
            verified: true,
          },
          {
            name: "فاطمة الزهراء برادة",
            city: "مراكش",
            rating: 5,
            comment: "خديت العرض ديال جوج قراعي، التوفير واضح والزيت كيبان من الضربة الأولى حر ومقطر على اليد.",
            date: "منذ أسبوع",
            verified: true,
          },
        ],
        faq: [
          {
            question: "كيفاش غادي نتوصل بالطلب ديالي؟",
            answer: "بمجرد إدخال معلوماتك أدناه، كيتصل بيك فريق خدمة العملاء ديالنا باش يأكد معاك العنوان، ومن بعد كيرسلوا ليك الطرد مع شركة التوصيل حتى لباب دارك.",
          },
          {
            question: "واش نقدر نفتح الكولية عاد نخلص؟",
            answer: "نعم بالتأكيد! يمكنك فتح الطرد والتأكد من سلامة القنينة وجودتها عاد تخلص الموزع ديال شركة التوصيل بكل أمان وثقة.",
          },
          {
            question: "شحال هي المدة ديال التوصيل؟",
            answer: "التوصيل كياخد ما بين 24 إلى 48 ساعة حسب مدينتك، والمدن الكبرى بحال كازا والرباط التوصيل كيكون فـ 24 ساعة.",
          },
        ],
      },
      sections: [],
      seo: {
        title: "زيت أركان مغربي أصيل 100% | عرض خاص BioZad",
        description: "اكتشف زيت الأركان الطبيعي الفاخر معصور على البارد لبشرة نضرة وشعر صحي. اطلب الآن مع الدفع عند الاستلام.",
      },
    };

    const res = await saveLandingPage(sampleData);
    return res;
  } catch (error: any) {
    console.error("Failed to seed sample landing page:", error);
    return { success: false, message: error.message };
  }
}