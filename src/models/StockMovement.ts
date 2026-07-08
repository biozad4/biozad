import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IStockMovement extends Document {
  product: mongoose.Types.ObjectId;
  variantSku?: string; // في حال كان المنتج يحتوي على متغيرات
  quantity: number; // قيمة موجبة (زيادة) أو سالبة (نقصان)
  type: "website_sale" | "pos_sale" | "refill" | "manual_adjustment" | "return" | "cancelled_order";
  performedBy: mongoose.Types.ObjectId; // الموظف أو النظام
  notes?: string;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantSku: { type: String },
    quantity: { type: Number, required: true },
    type: {
      type: String,
      enum: [
        "website_sale",
        "pos_sale",
        "refill",
        "manual_adjustment",
        "return",
        "cancelled_order",
      ],
      required: true,
      index: true,
    },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const StockMovement =
  models.StockMovement || model<IStockMovement>("StockMovement", StockMovementSchema);