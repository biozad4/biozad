import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IStoreSettings extends Document {
  shippingCost: number;
  freeShippingMin: number;
  isFreeShippingGlobally: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    shippingCost: { type: Number, default: 40 },
    freeShippingMin: { type: Number, default: 400 },
    isFreeShippingGlobally: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (models.StoreSettings) {
  delete (models as any).StoreSettings;
}

export const StoreSettingsModel = model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
