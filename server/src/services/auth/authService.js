import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";

const publicUser = (u) => ({ id: u.id, fullName: u.fullName, email: u.email, createdAt: u.createdAt });

export async function register({ fullName, email, password }) {
  const normalized = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    const e = new Error("Email is already registered");
    e.statusCode = 409;
    throw e;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { fullName: fullName.trim(), email: normalized, passwordHash }
  });
  return publicUser(user);
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const e = new Error("Invalid email or password");
    e.statusCode = 401;
    throw e;
  }
  const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  return { user: publicUser(user), token };
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    const e = new Error("Current password is incorrect");
    e.statusCode = 400;
    throw e;
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
