import { z } from "zod";

const cleanString = (max) => z.string().trim().min(1).max(max);
export const registerInput = z.object({
  name: cleanString(120),
  email: z.email().max(254),
  password: z.string().min(10, "Use at least 10 characters for your password.").max(100),
  role: z.enum(["buyer", "vendor"]).default("buyer"),
});
export const vendorInput = z.object({
  name: cleanString(120), town: cleanString(80), category: z.enum(["Food", "Crafts"]),
  description: cleanString(1200), capacity: z.string().trim().max(160).optional(),
  contactPhone: z.string().trim().max(40).optional(), contactEmail: z.union([z.email().max(254), z.literal("")]).optional(),
  certifications: z.array(cleanString(120)).max(20).default([]),
});
export const productInput = z.object({
  name: cleanString(120), description: z.string().trim().max(1000).optional(),
  unit: cleanString(40), priceTiers: z.array(z.object({ minQty: z.number().int().min(1), price: z.number().min(0) })).max(20).default([]),
  images: z.array(z.url()).max(8).default([]),
});
export const quoteInput = z.object({
  vendor: z.string().regex(/^[a-f\d]{24}$/i), product: cleanString(120), quantity: z.coerce.number().int().min(1),
  neededBy: z.coerce.date(), destination: cleanString(300), notes: z.string().trim().max(2000).optional(),
});
export const bulletinInput = z.object({
  type: z.enum(["need", "supply"]), material: cleanString(120), amount: cleanString(120), town: cleanString(80),
});
