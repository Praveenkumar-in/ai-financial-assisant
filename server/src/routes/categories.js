import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { ok } from "../utils/api.js";
export const categoriesRouter = Router();
categoriesRouter.use(requireAuth);
categoriesRouter.get("/", async (req,res) => ok(res, await prisma.category.findMany({ orderBy:{name:"asc"} })));
