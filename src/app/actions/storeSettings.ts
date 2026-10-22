"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// 1. جلب إعدادات المتجر العامة (الشحن والتوصيل)
export async function getStoreSettings() {
  try {
    const { data: settings, error } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !settings) {
      return {
        success: true,
        settings: {
          shippingCost: 40,
          freeShippingMin: 400,
          isFreeShippingGlobally: false,
        },
      };
    }

    return {
      success: true,
      settings: {
        _id: settings.id,
        shippingCost: Number(settings.shipping_cost),
        freeShippingMin: Number(settings.free_shipping_min),
        isFreeShippingGlobally: settings.is_free_shipping_globally,
      },
    };
  } catch (error: any) {
    console.error("Error getting store settings:", error);
    return { success: false, message: error.message };
  }
}

// 2. حفظ وتعديل إعدادات الشحن والتوصيل من الداشبورد
export async function saveStoreSettings(data: any) {
  try {
    const { shippingCost, freeShippingMin, isFreeShippingGlobally } = data;

    const payload = {
      shipping_cost: Number(shippingCost),
      free_shipping_min: Number(freeShippingMin),
      is_free_shipping_globally: isFreeShippingGlobally === true,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("store_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    let saved;
    if (existing) {
      const { data, error } = await supabase
        .from("store_settings")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      saved = data;
    } else {
      const { data, error } = await supabase
        .from("store_settings")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      saved = data;
    }

    revalidatePath("/checkout");
    revalidatePath("/admin");

    return { 
      success: true, 
      message: "✓ تم حفظ وتحديث إعدادات الشحن والتوصيل بنجاح!", 
      settings: {
        _id: saved.id,
        shippingCost: Number(saved.shipping_cost),
        freeShippingMin: Number(saved.free_shipping_min),
        isFreeShippingGlobally: saved.is_free_shipping_globally,
      } 
    };
  } catch (error: any) {
    console.error("Error saving store settings:", error);
    return { success: false, message: error.message };
  }
}
