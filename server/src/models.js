import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["buyer", "vendor", "officer"], default: "buyer", required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const vendorSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  town: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, enum: ["Food", "Crafts"], required: true },
  description: { type: String, required: true, trim: true, maxlength: 1200 },
  capacity: { type: String, trim: true, maxlength: 160 },
  contactPhone: { type: String, trim: true, maxlength: 40 },
  contactEmail: { type: String, lowercase: true, trim: true, maxlength: 254 },
  certifications: [{ type: String, trim: true, maxlength: 120 }],
  verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending", required: true },
  verificationReason: { type: String, trim: true, maxlength: 500 },
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  verifiedAt: Date,
}, { timestamps: true });
vendorSchema.index({ name: "text", town: "text" });
vendorSchema.index({ category: 1, verificationStatus: 1, town: 1 });

const productSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  unit: { type: String, required: true, trim: true, maxlength: 40 },
  priceTiers: [{ minQty: { type: Number, min: 1, required: true }, price: { type: Number, min: 0, required: true } }],
  images: [{ type: String, trim: true }],
}, { timestamps: true });

const quoteSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
  buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  product: { type: String, required: true, trim: true, maxlength: 120 },
  quantity: { type: Number, required: true, min: 1 },
  neededBy: { type: Date, required: true },
  destination: { type: String, required: true, trim: true, maxlength: 300 },
  notes: { type: String, trim: true, maxlength: 2000 },
  status: { type: String, enum: ["sent", "replied", "accepted", "declined"], default: "sent" },
  reply: { type: String, trim: true, maxlength: 2000 },
}, { timestamps: { createdAt: true, updatedAt: true } });

const bulletinSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["need", "supply"], required: true },
  material: { type: String, required: true, trim: true, maxlength: 120 },
  amount: { type: String, required: true, trim: true, maxlength: 120 },
  town: { type: String, required: true, trim: true, maxlength: 80 },
  active: { type: Boolean, default: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
bulletinSchema.index({ active: 1, createdAt: -1 });

export const User = models.User || model("User", userSchema);
export const Vendor = models.Vendor || model("Vendor", vendorSchema);
export const Product = models.Product || model("Product", productSchema);
export const Quote = models.Quote || model("Quote", quoteSchema);
export const Bulletin = models.Bulletin || model("Bulletin", bulletinSchema);
