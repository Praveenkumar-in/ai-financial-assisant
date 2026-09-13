import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as c from "../controllers/aiController.js";

export const aiRouter = Router();
aiRouter.use(requireAuth);
aiRouter.post("/chat", validate(z.object({ message: z.string().min(2).max(2000), conversationId: z.string().optional().nullable() })), c.chat);
aiRouter.get("/conversations", c.conversations);
aiRouter.get("/conversations/:id", c.conversation);
