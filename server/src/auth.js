import jwt from "jsonwebtoken";
import { User } from "./models.js";

export async function requireAuth(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Sign in to continue." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("name email role");
    if (!user) return res.status(401).json({ error: "Your account was not found. Sign in again." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Your session is invalid or expired. Sign in again." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `This action requires one of these roles: ${roles.join(", ")}.` });
    }
    next();
  };
}
