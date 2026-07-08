"use server";

import { connectDB } from "@/lib/db";
import { StoreSettingsModel } from "@/models/StoreSettings";
import { revalidatePath } from "next/cache";

// 1. جلب إعدادات المتجر العامة (الشحن والتوصيل)
export async function getStoreSettings() {
  try {
    await connectDB();
    const settings = await StoreSettingsModel.findOne().lean();
    if (!settings) {
      // إرجاع القيم الافتراضية إذا لم يتم حفظها في قاعدة البيانات بعد
      return {
        success: true,
        settings: {
          shippingCost: 40,
          freeShippingMin: 400,
          isFreeShippingGlobally: false,
        }
      };
    }
    return { success: true, settings: JSON.parse(JSON.stringify(settings)) };
  } catch (error: any) {
    console.error("Error getting store settings:", error);
    return { success: false, message: error.message };
  }
}

// 2. حفظ وتعديل إعدادات الشحن والتوصيل من الداشبورد
export async function saveStoreSettings(data: any) {
  try {
    await connectDB();

    const { shippingCost, freeShippingMin, isFreeShippingGlobally } = data;

    const payload = {
      shippingCost: Number(shippingCost),
      freeShippingMin: Number(freeShippingMin),
      isFreeShippingGlobally: isFreeShippingGlobally === true,
    };

    const existing = await StoreSettingsModel.findOne();
    let saved;

    if (existing) {
      saved = await StoreSettingsModel.findByIdAndUpdate(existing._id, payload, { new: true });
    } else {
      saved = await StoreSettingsModel.create(payload);
    }

    revalidatePath("/checkout");
    revalidatePath("/admin");

    return { 
      success: true, 
      message: "✓ تم حفظ وتحديث إعدادات الشحن والتوصيل بنجاح!", 
      settings: JSON.parse(JSON.stringify(saved)) 
    };
  } catch (error: any) {
    console.error("Error saving store settings:", error);
    return { success: false, message: error.message };
  }
}
