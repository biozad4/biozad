import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: "admin" | "manager" | "cashier" | "customer";
  phone?: string;
  loyaltyPoints: number; // الحقل الجديد للنقاط
  addresses: {
    street: string;
    city: string;
    postalCode?: string;
    country: string;
    isDefault: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["admin", "manager", "cashier", "customer"],
      default: "customer",
    },
    phone: { type: String },
    loyaltyPoints: { type: Number, default: 0 }, // قيمة افتراضية صفر
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String },
        country: { type: String, default: "Morocco" },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);