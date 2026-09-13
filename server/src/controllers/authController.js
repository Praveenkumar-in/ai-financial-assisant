import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/api.js";
import { env } from "../config/env.js";
import * as auth from "../services/auth/authService.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const register = asyncHandler(async (req, res) => {
  const user = await auth.register(req.body);
  const { token } = await auth.login(req.body);
  res.cookie("financeai_token", token, cookieOptions);
  ok(res, { user }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await auth.login(req.body);
  res.cookie("financeai_token", result.token, cookieOptions);
  ok(res, { user: result.user });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("financeai_token", cookieOptions);
  ok(res, { loggedOut: true });
});

export const me = asyncHandler(async (req, res) => ok(res, { user: req.user }));

export const changePassword = asyncHandler(async (req, res) => {
  await auth.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  ok(res, { changed: true });
});
