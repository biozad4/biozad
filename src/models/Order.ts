import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variantSku?: string;
  title: string;
  weight?: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  orderNumber: string; // رمز فريد وسهل القراءة للمتابعة (مثال: BZ-10023)
  customer?: mongoose.Types.ObjectId; // اختياري في حال الشراء السريع كزائر أو POS بدون عميل مسجل
  guestDetails?: {
    name: string;
    email?: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  couponUsed?: mongoose.Types.ObjectId;
  source: "website" | "pos";
  paymentMethod: "cod" | "cash_pos" | "card_pos" | "store_credit_pos";
  status: "pending" | "confirmed" | "preparing" | "shipping" | "delivered" | "cancelled" | "returned";
  cashier?: mongoose.Types.ObjectId; // الموظف الذي أجرى البيع في حال كان المصدر POS
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestDetails: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      city: { type: String },
      address: { type: String },
      notes: { type: String },
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantSku: { type: String },
        title: { type: String, required: true },
        weight: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponUsed: { type: Schema.Types.ObjectId, ref: "Coupon" },
    source: { type: String, enum: ["website", "pos"], required: true, index: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "cash_pos", "card_pos", "store_credit_pos"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "shipping", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true,
    },
    cashier: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Order = models.Order || model<IOrder>("Order", OrderSchema);