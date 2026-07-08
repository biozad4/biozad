import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  appliesToType: "all" | "category" | "product" | "variant_weight"; // مستويات التوجيه
  targetCategoryId?: mongoose.Types.ObjectId;
  targetProductId?: mongoose.Types.ObjectId;
  targetWeight?: string; // مثلاً: "1kg"
  isActive: boolean;
  expirationDate?: Date;
  createdAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, index: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    appliesToType: { 
      type: String, 
      enum: ["all", "category", "product", "variant_weight"], 
      default: "all" 
    },
    targetCategoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    targetProductId: { type: Schema.Types.ObjectId, ref: "Product" },
    targetWeight: { type: String }, // مثلاً: "1kg" أو "500g"
    isActive: { type: Boolean, default: true },
    expirationDate: { type: Date },
  },
  { timestamps: true }
);

export const Coupon = models.Coupon || model<ICoupon>("Coupon", CouponSchema);