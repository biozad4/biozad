import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ILandingPage extends Document {
  title: string;
  slug: string; // الرابط المخصص للصفحة (مثال: biozad.com/lp/argan-oil)
  isActive: boolean;
  hero: {
    title: { ar: string; fr: string };
    subtitle?: { ar: string; fr: string };
    image: string;
    ctaText: { ar: string; fr: string };
  };
  sections: {
    type: "features" | "products_grid" | "video_reviews" | "faq" | "custom_html";
    title?: { ar: string; fr: string };
    content?: string; // في حال استخدام HTML أو نصوص مخصصة
    products?: mongoose.Types.ObjectId[]; // المنتجات المعروضة في هذا القسم لطلبها فوراً
    data?: any; // أي إعدادات إضافية مرنة للقسم
  }[];
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const LandingPageSchema = new Schema<ILandingPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
    hero: {
      title: {
        ar: { type: String, required: true },
        fr: { type: String, required: true },
      },
      subtitle: {
        ar: { type: String },
        fr: { type: String },
      },
      image: { type: String, required: true },
      ctaText: {
        ar: { type: String, required: true },
        fr: { type: String, required: true },
      },
    },
    sections: [
      {
        type: {
          type: String,
          enum: ["features", "products_grid", "video_reviews", "faq", "custom_html"],
          required: true,
        },
        title: {
          ar: { type: String },
          fr: { type: String },
        },
        content: { type: String },
        products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
        data: { type: Schema.Types.Mixed },
      },
    ],
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const LandingPage = models.LandingPage || model<ILandingPage>("LandingPage", LandingPageSchema);