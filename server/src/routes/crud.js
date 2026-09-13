import { Router } from "express";
import { z } from "zod";
import * as c from "../controllers/crudController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const id = z.string().min(1);
const account = z.object({
  name: z.string().min(1).max(100),
  institution: z.string().max(100).optional().nullable(),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD", "WALLET", "INVESTMENT"]),
  balance: z.coerce.number(),
  currency: z.string().length(3).default("INR"),
  maskedNumber: z.string().max(30).optional().nullable(),
  isConnected: z.boolean().optional()
});
const transaction = z.object({
  date: z.string(),
  description: z.string().min(1).max(200),
  amount: z.coerce.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().optional(),
  accountId: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable()
});
const budget = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  categories: z.array(z.object({ categoryId: id, amount: z.coerce.number().nonnegative() })).min(1)
});
const goal = z.object({
  name: z.string().min(1).max(100),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().nonnegative(),
  targetDate: z.string(),
  monthlyContribution: z.coerce.number().nonnegative()
});

export const accountsRouter = Router();
accountsRouter.use(requireAuth);
accountsRouter.get("/", c.listAccounts);
accountsRouter.get("/:id", c.getAccount);
accountsRouter.post("/", validate(account), c.createAccount);
accountsRouter.put("/:id", validate(account.partial()), c.updateAccount);
accountsRouter.delete("/:id", c.deleteAccount);

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);
transactionsRouter.get("/", c.listTransactions);
transactionsRouter.get("/:id", c.getTransaction);
transactionsRouter.post("/", validate(transaction), c.createTransaction);
transactionsRouter.put("/:id", validate(transaction.partial()), c.updateTransaction);
transactionsRouter.delete("/:id", c.deleteTransaction);

export const budgetsRouter = Router();
budgetsRouter.use(requireAuth);
budgetsRouter.get("/", c.listBudgets);
budgetsRouter.post("/", validate(budget), c.createBudget);
budgetsRouter.put("/:id", validate(budget), c.updateBudget);
budgetsRouter.delete("/:id", c.deleteBudget);

export const goalsRouter = Router();
goalsRouter.use(requireAuth);
goalsRouter.get("/", c.listGoals);
goalsRouter.post("/", validate(goal), c.createGoal);
goalsRouter.put("/:id", validate(goal.partial()), c.updateGoal);
goalsRouter.delete("/:id", c.deleteGoal);

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);
dashboardRouter.get("/summary", c.dashboard);
dashboardRouter.get("/cash-flow", c.cashFlowController);
dashboardRouter.get("/categories", c.categoriesController);
dashboardRouter.get("/trends", c.trendsController);
