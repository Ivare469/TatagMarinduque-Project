import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { connectDatabase } from "./db.js";
import { requireAuth, requireRole } from "./auth.js";
import { Bulletin, Product, Quote, User, Vendor } from "./models.js";
import { buildVendorFilter } from "./search.js";
import { bulletinInput, productInput, quoteInput, registerInput, vendorInput } from "./validation.js";

const app = express();
const port = Number(process.env.PORT || 4000);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));

function parseInput(schema, input, res) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    res.status(400).json({ error: "Some information is missing or invalid. Check the highlighted fields.", details: z.flattenError(parsed.error).fieldErrors });
    return null;
  }
  return parsed.data;
}
function issueToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const input = parseInput(registerInput, req.body, res);
    if (!input) return;
    if (await User.exists({ email: input.email.toLowerCase() })) return res.status(409).json({ error: "An account already uses this email. Sign in or use a different email." });
    const user = await User.create({ ...input, email: input.email.toLowerCase(), passwordHash: await bcrypt.hash(input.password, 12) });
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const input = parseInput(z.object({ email: z.email(), password: z.string().min(1) }), req.body, res);
    if (!input) return;
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: "Email or password is incorrect. Check your details and try again." });
    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.get("/api/vendors", async (req, res, next) => {
  try {
    const filter = buildVendorFilter(req.query);
    const vendors = await Vendor.find(filter).sort({ name: 1 }).limit(100).lean();
    const products = await Product.find({ vendor: { $in: vendors.map((vendor) => vendor._id) } }).select("vendor name unit priceTiers").lean();
    res.json(vendors.map((vendor) => ({ ...vendor, products: products.filter((product) => String(product.vendor) === String(vendor._id)) })));
  } catch (error) { next(error); }
});

app.get("/api/vendors/:id", async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).lean();
    if (!vendor) return res.status(404).json({ error: "This maker profile was not found." });
    const products = await Product.find({ vendor: vendor._id }).lean();
    res.json({ ...vendor, products });
  } catch (error) { next(error); }
});

app.post("/api/vendors", requireAuth, requireRole("vendor"), async (req, res, next) => {
  try {
    const input = parseInput(vendorInput, req.body, res);
    if (!input) return;
    const existing = await Vendor.findOne({ owner: req.user._id });
    if (existing) return res.status(409).json({ error: "Your maker profile already exists. Edit your existing profile instead." });
    res.status(201).json(await Vendor.create({ ...input, owner: req.user._id }));
  } catch (error) { next(error); }
});

app.put("/api/vendors", requireAuth, requireRole("vendor"), async (req, res, next) => {
  try {
    const input = parseInput(vendorInput, req.body, res);
    if (!input) return;
    const vendor = await Vendor.findOneAndUpdate({ owner: req.user._id }, { ...input, verificationStatus: "pending", verifiedBy: null, verifiedAt: null }, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ error: "Your maker profile was not found. Create it first." });
    res.json(vendor);
  } catch (error) { next(error); }
});

app.patch("/api/vendors/:id/verify", requireAuth, requireRole("officer"), async (req, res, next) => {
  try {
    const input = parseInput(z.object({ status: z.enum(["verified", "rejected"]), reason: z.string().trim().max(500).optional() }), req.body, res);
    if (!input) return;
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, {
      verificationStatus: input.status, verificationReason: input.reason || "", verifiedBy: req.user._id, verifiedAt: new Date(),
    }, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ error: "This maker profile was not found." });
    res.json(vendor);
  } catch (error) { next(error); }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const filter = {};
    if (typeof req.query.vendor === "string") filter.vendor = req.query.vendor;
    res.json(await Product.find(filter).limit(200).lean());
  } catch (error) { next(error); }
});

app.post("/api/products", requireAuth, requireRole("vendor"), async (req, res, next) => {
  try {
    const input = parseInput(productInput, req.body, res);
    if (!input) return;
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return res.status(404).json({ error: "Create your maker profile before adding products." });
    res.status(201).json(await Product.create({ ...input, vendor: vendor._id }));
  } catch (error) { next(error); }
});

app.put("/api/products/:id", requireAuth, requireRole("vendor"), async (req, res, next) => {
  try {
    const input = parseInput(productInput, req.body, res);
    if (!input) return;
    const vendor = await Vendor.findOne({ owner: req.user._id });
    const product = vendor && await Product.findOneAndUpdate({ _id: req.params.id, vendor: vendor._id }, input, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: "This product was not found in your maker profile." });
    res.json(product);
  } catch (error) { next(error); }
});

app.delete("/api/products/:id", requireAuth, requireRole("vendor"), async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    const product = vendor && await Product.findOneAndDelete({ _id: req.params.id, vendor: vendor._id });
    if (!product) return res.status(404).json({ error: "This product was not found in your maker profile." });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.post("/api/quotes", requireAuth, requireRole("buyer"), async (req, res, next) => {
  try {
    const input = parseInput(quoteInput, req.body, res);
    if (!input) return;
    const vendor = await Vendor.findById(input.vendor);
    if (!vendor) return res.status(404).json({ error: "This maker profile was not found." });
    if (vendor.verificationStatus !== "verified") return res.status(409).json({ error: "This maker is not verified yet. Choose a DTI-verified maker for quote requests." });
    const { vendor: vendorId, ...details } = input;
    res.status(201).json(await Quote.create({ ...details, vendor: vendorId, buyer: req.user._id }));
  } catch (error) { next(error); }
});

app.get("/api/quotes", requireAuth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "buyer") filter.buyer = req.user._id;
    else if (req.user.role === "vendor") {
      const vendor = await Vendor.findOne({ owner: req.user._id });
      if (!vendor) return res.json([]);
      filter.vendor = vendor._id;
    } else return res.status(403).json({ error: "Officer accounts cannot view quote requests." });
    res.json(await Quote.find(filter).populate("vendor", "name town").populate("buyer", "name email").sort({ createdAt: -1 }).lean());
  } catch (error) { next(error); }
});

app.patch("/api/quotes/:id", requireAuth, requireRole("vendor"), async (req, res, next) => {
  try {
    const input = parseInput(z.object({ status: z.enum(["replied", "accepted", "declined"]), reply: z.string().trim().max(2000).optional() }), req.body, res);
    if (!input) return;
    const vendor = await Vendor.findOne({ owner: req.user._id });
    const quote = vendor && await Quote.findOneAndUpdate({ _id: req.params.id, vendor: vendor._id }, input, { new: true, runValidators: true });
    if (!quote) return res.status(404).json({ error: "This quote request was not found in your inbox." });
    res.json(quote);
  } catch (error) { next(error); }
});

app.get("/api/bulletin", async (req, res, next) => {
  try {
    const filter = { active: true };
    if (["need", "supply"].includes(req.query.type)) filter.type = req.query.type;
    res.json(await Bulletin.find(filter).populate("author", "name role").sort({ createdAt: -1 }).limit(100).lean());
  } catch (error) { next(error); }
});

app.post("/api/bulletin", requireAuth, async (req, res, next) => {
  try {
    const input = parseInput(bulletinInput, req.body, res);
    if (!input) return;
    res.status(201).json(await Bulletin.create({ ...input, author: req.user._id }));
  } catch (error) { next(error); }
});

app.delete("/api/bulletin/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await Bulletin.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!post) return res.status(404).json({ error: "This post was not found in your account." });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.code === 11000) return res.status(409).json({ error: "This information is already in use. Check your entry and try again." });
  if (error?.name === "CastError") return res.status(400).json({ error: "The requested record ID is not valid." });
  res.status(500).json({ error: "Something went wrong on the server. Try again shortly." });
});

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing. Copy .env.example to .env and set a long random secret.");
connectDatabase().then(() => app.listen(port, () => console.log(`TatagMarinduque API listening on port ${port}`))).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
