import React from "react";
import { CheckoutForm } from "@/components/customer/CheckoutForm";
import { getStoreSettings } from "@/app/actions/storeSettings";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const res = await getStoreSettings();
  const settings = res.success && res.settings 
    ? res.settings 
    : { shippingCost: 40, freeShippingMin: 400, isFreeShippingGlobally: false, whatsappNumber: "212602732533" };

  return (
    <main className="bg-[#FAF9F6] dark:bg-neutral-950 min-h-screen py-12">
      <CheckoutForm settings={settings} />
    </main>
  );
}
