import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IFeaturedBundle extends Document {
  title: { ar: string; fr: string };
  description: { ar: string; fr: string };
  price: number;
  compareAtPrice?: number;
  image: string;
  isActive: boolean;
  hotProductTitle?: { ar: string; fr: string };
  hotProductSub?: { ar: string; fr: string };
  hotProductImage?: string;
  hotProductLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeaturedBundleSchema = new Schema<IFeaturedBundle>(
  {
    title: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
    },
    description: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
    },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    hotProductTitle: {
      ar: { type: String },
      fr: { type: String },
    },
    hotProductSub: {
      ar: { type: String },
      fr: { type: String },
    },
    hotProductImage: { type: String },
    hotProductLink: { type: String },
  },
  { timestamps: true }
);

// حذف الموديل المخزن مؤقتاً لتجنب تجاهل الحقول الجديدة من قبل Mongoose عند استدعائه
if (models.FeaturedBundle) {
  delete (models as any).FeaturedBundle;
}

export const FeaturedBundleModel = model<IFeaturedBundle>("FeaturedBundle", FeaturedBundleSchema);
