function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildVendorFilter(query) {
  const filter = {};
  if (["Food", "Crafts"].includes(query.category)) filter.category = query.category;
  if (query.verified === "true") filter.verificationStatus = "verified";
  if (typeof query.q === "string" && query.q.trim()) {
    const expression = new RegExp(escapeRegex(query.q.trim().slice(0, 100)), "i");
    filter.$or = [{ name: expression }, { town: expression }, { description: expression }];
  }
  return filter;
}
