import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/api.js";
import { env } from "../config/env.js";
import * as auth from "../services/auth/authService.js";

const isProduction = env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
};

export const register = asyncHandler(async (req, res) => {
  const user = await auth.register(req.body);

  const { token } = await auth.login(req.body);

  res.cookie(
    "financeai_token",
    token,
    cookieOptions
  );

  return ok(
    res,
    {
      user
    },
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await auth.login(req.body);

  res.cookie(
    "financeai_token",
    result.token,
    cookieOptions
  );

  return ok(res, {
    user: result.user
  });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(
    "financeai_token",
    {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/"
    }
  );

  return ok(res, {
    loggedOut: true
  });
});

export const me = asyncHandler(async (req, res) => {
  return ok(res, {
    user: req.user
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await auth.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );

  return ok(res, {
    changed: true
  });
});