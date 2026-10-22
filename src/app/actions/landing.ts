"use server";

import { supabase } from "@/lib/supabase";

function mapLandingPage(p: any) {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    slug: p.slug,
    title: p.title,
    isActive: p.is_active,
    hero: p.hero,
    sections: p.sections,
    seo: p.seo,
    createdAt: p.created_at,
  };
}

// 1. حفظ أو تعديل صفحة هبوط
export async function saveLandingPage(data: any) {
  try {
    const { _id, slug, title, isActive, hero, sections, seo } = data;

    if (!slug) {
      return { success: false, message: "الرابط المخصص (Slug) مطلوب" };
    }

    const payload = {
      slug,
      title,
      is_active: isActive !== false,
      hero,
      sections,
      seo,
      updated_at: new Date().toISOString(),
    };

    if (_id) {
      const { data: updated, error } = await supabase
        .from("landing_pages")
        .update(payload)
        .eq("id", _id)
        .select()
        .single();
      if (error) throw error;
      return { success: true, page: mapLandingPage(updated) };
    } else {
      const { data: existing } = await supabase
        .from("landing_pages")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        return { success: false, message: "هذا الرابط المخصص مستخدم بالفعل في صفحة أخرى" };
      }

      const { data: created, error } = await supabase
        .from("landing_pages")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { success: true, page: mapLandingPage(created) };
    }
  } catch (error: any) {
    console.error("Failed to save landing page:", error);
    return { success: false, message: `فشل حفظ صفحة الهبوط: ${error.message}` };
  }
}

// 2. جلب تفاصيل صفحة هبوط
export async function getLandingPageBySlug(slug: string) {
  try {
    const { data: page, error } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !page) return null;
    return mapLandingPage(page);
  } catch (error) {
    console.error("Failed to fetch landing page:", error);
    return null;
  }
}