import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "./db.js";
import { Bulletin, Product, User, Vendor } from "./models.js";

await connectDatabase();
const priorOwner = await User.findOne({ email: "sample-maker@example.invalid" });
const priorVendors = await Vendor.find({ name: /^Sample Maker/ }).select("_id");
await Promise.all([
  Product.deleteMany({ vendor: { $in: priorVendors.map((vendor) => vendor._id) } }),
  Bulletin.deleteMany({ author: priorOwner?._id }),
  Vendor.deleteMany({ _id: { $in: priorVendors.map((vendor) => vendor._id) } }),
  User.deleteOne({ email: "sample-maker@example.invalid" }),
]);
const owner = await User.create({
  name: "Sample Maker Account", email: "sample-maker@example.invalid",
  passwordHash: await bcrypt.hash("sample-password-not-for-use", 12), role: "vendor",
});
const sampleVendors = [
  ["Sample Maker 01 - Uraro Kitchen", "Torrijos", "Food", "Sample small-batch arrowroot cookies for the project prototype.", "verified"],
  ["Sample Maker 02 - Isla Clay Studio", "Boac", "Crafts", "Sample handmade pottery for the project prototype.", "verified"],
  ["Sample Maker 03 - Coconut Grove Co-op", "Buenavista", "Food", "Sample coconut goods for the project prototype.", "verified"],
  ["Sample Maker 04 - Habing Marinduque", "Gasan", "Crafts", "Sample woven home goods for the project prototype.", "verified"],
  ["Sample Maker 05 - Island Pantry", "Mogpog", "Food", "Sample local pantry products for the project prototype.", "pending"],
  ["Sample Maker 06 - Loom & Fiber", "Santa Cruz", "Crafts", "Sample woven pieces for the project prototype.", "pending"],
];
const sampleVendorIds = [
  "650000000000000000000001", "650000000000000000000002", "650000000000000000000003",
  "650000000000000000000004", "650000000000000000000005", "650000000000000000000006",
];
const vendors = await Vendor.insertMany(sampleVendors.map(([name, town, category, description, verificationStatus], index) => ({
  _id: new mongoose.Types.ObjectId(sampleVendorIds[index]),
  owner: owner._id, name, town, category, description, capacity: "Sample capacity; replace with confirmed data.",
  certifications: [], verificationStatus,
})));
const productRows = [
  ["Sample uraro cookies", "box", 180], ["Sample clay serving bowl", "piece", 250],
  ["Sample coconut oil", "bottle", 150], ["Sample woven basket", "piece", 320],
  ["Sample pantry bundle", "bundle", 200], ["Sample woven placemat", "piece", 120],
];
await Product.insertMany(vendors.map((vendor, index) => ({
  vendor: vendor._id, name: productRows[index][0], description: "Sample catalog item; not an actual offer.",
  unit: productRows[index][1], priceTiers: [{ minQty: 1, price: productRows[index][2] }], images: [],
})));
await Bulletin.deleteMany({ material: /^Sample / });
await Bulletin.insertMany([
  { author: owner._id, type: "need", material: "Sample arrowroot starch", amount: "Sample 25 kg", town: "Torrijos" },
  { author: owner._id, type: "supply", material: "Sample coconut shells", amount: "Sample 200 pieces", town: "Buenavista" },
  { author: owner._id, type: "need", material: "Sample pottery clay", amount: "Sample 10 sacks", town: "Boac" },
]);
console.log("Seeded 6 clearly labeled sample vendors, products, and 3 sample bulletin posts.");
await mongoose.disconnect();
