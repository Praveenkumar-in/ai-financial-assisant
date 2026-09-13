import { Router } from "express";
import { z } from "zod";
import { register, login, logout, me, changePassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const password = z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/);
const credentials = z.object({ email: z.string().email(), password });
export const authRouter = Router();
authRouter.post("/register", validate(z.object({ fullName: z.string().min(2).max(100), email: z.string().email(), password, confirmPassword: z.string() }).refine(x => x.password === x.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })), register);
authRouter.post("/login", validate(credentials), login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.put("/password", requireAuth, validate(z.object({ currentPassword: password, newPassword: password })), changePassword);
