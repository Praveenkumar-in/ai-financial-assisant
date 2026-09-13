import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.financeai_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);
    if (!token) return res.status(401).json({ success: false, message: "Authentication required" });

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, fullName: true, email: true }
    });
    if (!user) return res.status(401).json({ success: false, message: "Authentication required" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired authentication" });
  }
}
