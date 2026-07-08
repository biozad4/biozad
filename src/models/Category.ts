import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICategory extends Document {
  name: { ar: string; fr: string };
  slug: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      ar: { type: String, required: true },
      fr: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true, index: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = models.Category || model<ICategory>("Category", CategorySchema);