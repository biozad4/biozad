import React from "react";
import { PosInterface } from "@/components/pos/PosInterface";

export const metadata = {
  title: "BioZad | نظام نقطة البيع POS",
  description: "واجهة البيع المباشر ومسح الباركود السريعة لكاشير BioZad.",
};

export default function PosPage() {
  return (
    // واجهة نقطة البيع السريعة
    <PosInterface />
  );
}