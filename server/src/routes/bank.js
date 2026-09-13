import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as c from "../controllers/bankController.js";

export const bankRouter = Router();
bankRouter.use(requireAuth);
bankRouter.post("/connect", validate(z.object({ accountId: z.string().min(1) })), c.connect);
bankRouter.get("/consent/:id", c.consent);
bankRouter.post("/callback", c.callback);
bankRouter.post("/sync/:accountId", c.sync);
bankRouter.delete("/:accountId", c.disconnect);
