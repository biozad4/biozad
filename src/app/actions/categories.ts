"use server";

import { supabase } from "@/lib/supabase";

export async function getCategories() {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (categories || []).map((c: any) => ({
      _id: c.id,
      id: c.id,
      slug: c.slug,
      name: { ar: c.name_ar, fr: c.name_fr },
      image: c.image,
      isActive: c.is_active,
    }));
  } catch (error) {
    console.error("Failed to load categories:", error);
    return [];
  }
}
