import assert from "node:assert/strict";
import test from "node:test";
import { requireRole } from "../src/auth.js";
import { buildVendorFilter } from "../src/search.js";
import { bulletinInput, quoteInput, registerInput, vendorInput } from "../src/validation.js";

test("registration requires a valid email and a long password", () => {
  assert.equal(registerInput.safeParse({ name: "Sample Buyer", email: "buyer@example.test", password: "long-demo-password", role: "buyer" }).success, true);
  assert.equal(registerInput.safeParse({ name: "Sample Buyer", email: "not-an-email", password: "short" }).success, false);
});

test("vendor input accepts only supported categories and bounded fields", () => {
  assert.equal(vendorInput.safeParse({ name: "Sample Maker", town: "Boac", category: "Food", description: "Sample profile" }).success, true);
  assert.equal(vendorInput.safeParse({ name: "Sample Maker", town: "Boac", category: "Food", description: "Sample profile", contactEmail: "" }).success, true);
  assert.equal(vendorInput.safeParse({ name: "Sample Maker", town: "Boac", category: "Other", description: "Sample profile" }).success, false);
});

test("vendor search builds category, verification, and literal text filters", () => {
  const filter = buildVendorFilter({ q: ".*", category: "Crafts", verified: "true" });
  assert.equal(filter.category, "Crafts");
  assert.equal(filter.verificationStatus, "verified");
  assert.equal(filter.$or[0].name.test("any text"), false);
  assert.equal(filter.$or[0].name.test(".*"), true);
});

test("quote and bulletin payloads reject invalid values", () => {
  const quote = { vendor: "507f1f77bcf86cd799439011", product: "Sample product", quantity: "4", neededBy: "2027-01-01", destination: "Boac" };
  assert.equal(quoteInput.safeParse(quote).success, true);
  assert.equal(quoteInput.safeParse({ ...quote, quantity: "0" }).success, false);
  assert.equal(bulletinInput.safeParse({ type: "need", material: "Sample clay", amount: "5 sacks", town: "Boac" }).success, true);
  assert.equal(bulletinInput.safeParse({ type: "offer", material: "Sample clay", amount: "5 sacks", town: "Boac" }).success, false);
});

test("role guard allows the required role and blocks others", () => {
  let passed = false;
  requireRole("vendor")({ user: { role: "vendor" } }, {}, () => { passed = true; });
  assert.equal(passed, true);
  let statusCode = 0;
  const response = { status(code) { statusCode = code; return this; }, json() { return this; } };
  requireRole("officer")({ user: { role: "buyer" } }, response, () => { passed = true; });
  assert.equal(statusCode, 403);
});
