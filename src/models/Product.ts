import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IVariant {
  sku: string;
  barcode: string; // فريد لمسح الباركود السريع في الـ POS
  weight: string; // مثال: "50g", "100g", "1L"
  price: number;
  compareAtPrice?: number;
  stock: number;
}

export interface IProduct extends Document {
  title: { ar: string; fr: string };
  slug: string;
  description: { ar: string; fr: string };
  benefits?: { ar: string; fr: string };
  ingredients?: { ar: string; fr: string };
  usage?: { ar: string; fr: string };
  images: string[];
  videos?: string[];
  category: mongoose.Types.ObjectId;
  sku: string; // الرمز الأساسي في حال عدم وجود متغيرات
  barcode: string; // الباركود الأساسي للبحث ومسح الـ POS في حال عدم وجود متغيرات
  price: number;
  compareAtPrice?: number;
  stock: number;
  minStock: number; // للتحذير عند قرب نفاد المخزون
  variants: IVariant[];
  isActive: boolean;
  isFeatured?: boolean;
  isBundle?: boolean;
  averageRating: number;
  reviewsCount: number;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true, index: true },
    description: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
    },
    benefits: {
      ar: { type: String },
      fr: { type: String },
    },
    ingredients: {
      ar: { type: String },
      fr: { type: String },
    },
    usage: {
      ar: { type: String },
      fr: { type: String },
    },
    images: [{ type: String, required: true }],
    videos: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    barcode: { type: String, required: true, unique: true, index: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    stock: { type: Schema.Types.Number, required: true, default: 0 },
    minStock: { type: Schema.Types.Number, default: 5 },
    variants: [
      {
        sku: { type: String, required: true },
        barcode: { type: String, required: true },
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number },
        stock: { type: Number, required: true, default: 0 },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isBundle: { type: Boolean, default: false, index: true },
    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
  },
  { timestamps: true }
);

// فهرس مركب للبحث النصي السريع (مفيد للـ POS والمتجر)
ProductSchema.index({ "title.ar": "text", "title.fr": "text", sku: "text", barcode: "text" });

export const Product = models.Product || model<IProduct>("Product", ProductSchema);