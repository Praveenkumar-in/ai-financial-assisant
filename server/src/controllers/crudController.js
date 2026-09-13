import { prisma } from "../config/prisma.js";
import { ok } from "../utils/api.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { categorize } from "../services/finance/categorization.js";
import { dashboardSummary, cashFlow, getCategorySpending, trends, getBudgetStatus, getGoalProgress } from "../services/finance/calculations.js";

function notFound() { const e = new Error("Resource not found"); e.statusCode = 404; return e; }

export const listAccounts = asyncHandler(async (req, res) => ok(res, await prisma.account.findMany({ where: { userId: req.user.id }, orderBy: { updatedAt: "desc" } })));
export const getAccount = asyncHandler(async (req, res) => {
  const item = await prisma.account.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!item) throw notFound(); ok(res, item);
});
export const createAccount = asyncHandler(async (req, res) => ok(res, await prisma.account.create({ data: { ...req.body, userId: req.user.id } }), 201));
export const updateAccount = asyncHandler(async (req, res) => {
  if (!(await prisma.account.findFirst({ where: { id: req.params.id, userId: req.user.id } }))) throw notFound();
  ok(res, await prisma.account.update({ where: { id: req.params.id }, data: req.body }));
});
export const deleteAccount = asyncHandler(async (req, res) => {
  if (!(await prisma.account.findFirst({ where: { id: req.params.id, userId: req.user.id } }))) throw notFound();
  await prisma.account.delete({ where: { id: req.params.id } }); ok(res, { deleted: true });
});

export const listTransactions = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10, search, type, category, from, to, sort = "date", order = "desc" } = req.query;
  const where = { userId: req.user.id };
  if (type) where.type = type;
  if (category) {
    const c = await prisma.category.findUnique({ where: { name: category } });
    where.categoryId = c?.id || "__none__";
  }
  if (search) where.OR = [{ description: { contains: search, mode: "insensitive" } }, { notes: { contains: search, mode: "insensitive" } }];
  if (from || to) where.date = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };
  const allowed = { date: "date", amount: "amount", description: "description" };
  const orderBy = { [allowed[sort] || "date"]: order === "asc" ? "asc" : "desc" };
  const skip = (Number(page) - 1) * Number(pageSize);
  const [items, total] = await Promise.all([
    prisma.transaction.findMany({ where, include: { account: true, category: true }, orderBy, skip, take: Number(pageSize) }),
    prisma.transaction.count({ where })
  ]);
  ok(res, { items, total, page: Number(page), pageSize: Number(pageSize), pages: Math.ceil(total / Number(pageSize)) });
});

export const getTransaction = asyncHandler(async (req, res) => {
  const item = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: { account: true, category: true } });
  if (!item) throw notFound(); ok(res, item);
});

export const createTransaction = asyncHandler(async (req, res) => {
  const body = req.body;
  if (body.accountId && !(await prisma.account.findFirst({ where: { id: body.accountId, userId: req.user.id } }))) throw notFound();
  let category = body.category;
  if (!category) category = (await categorize(body)).category;
  const cat = await prisma.category.findUnique({ where: { name: category } });
  const classified = await categorize(body);
  ok(res, await prisma.transaction.create({
    data: { userId: req.user.id, date: new Date(body.date), description: body.description, amount: body.amount, type: body.type, accountId: body.accountId || null, categoryId: cat?.id, notes: body.notes, categoryConfidence: classified.confidence, categoryReason: classified.reason }
  }), 201);
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const existing = await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!existing) throw notFound();
  if (req.body.accountId && !(await prisma.account.findFirst({ where: { id: req.body.accountId, userId: req.user.id } }))) throw notFound();
  const data = { ...req.body, ...(req.body.date ? { date: new Date(req.body.date) } : {}) };
  if (req.body.category) {
    const c = await prisma.category.findUnique({ where: { name: req.body.category } });
    data.categoryId = c?.id;
    delete data.category;
  }
  delete data.userId;
  ok(res, await prisma.transaction.update({ where: { id: req.params.id }, data }));
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  if (!(await prisma.transaction.findFirst({ where: { id: req.params.id, userId: req.user.id } }))) throw notFound();
  await prisma.transaction.delete({ where: { id: req.params.id } }); ok(res, { deleted: true });
});

export const listBudgets = asyncHandler(async (req, res) => {
  const budgets = await prisma.budget.findMany({ where: { userId: req.user.id }, include: { categories: { include: { category: true } } }, orderBy: { month: "desc" } });
  const status = await getBudgetStatus(req.user.id);
  ok(res, budgets.map(b => ({ ...b, currentStatus: b.month.getMonth() === new Date().getMonth() ? status : [] })));
});
export const createBudget = asyncHandler(async (req, res) => {
  const month = new Date(`${req.body.month}-01T00:00:00`);
  const data = req.body.categories.map(x => ({ categoryId: x.categoryId, amount: x.amount }));
  ok(res, await prisma.budget.create({ data: { userId: req.user.id, month, categories: { create: data } }, include: { categories: true } }), 201);
});
export const updateBudget = asyncHandler(async (req, res) => {
  const b = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!b) throw notFound();
  await prisma.budgetCategory.deleteMany({ where: { budgetId: b.id } });
  ok(res, await prisma.budget.update({ where: { id: b.id }, data: { categories: { create: req.body.categories.map(x => ({ categoryId: x.categoryId, amount: x.amount })) } }, include: { categories: { include: { category: true } } } }));
});
export const deleteBudget = asyncHandler(async (req, res) => {
  if (!(await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.user.id } }))) throw notFound();
  await prisma.budget.delete({ where: { id: req.params.id } }); ok(res, { deleted: true });
});

export const listGoals = asyncHandler(async (req, res) => ok(res, await getGoalProgress(req.user.id)));
export const createGoal = asyncHandler(async (req, res) => ok(res, await prisma.goal.create({ data: { ...req.body, userId: req.user.id, targetDate: new Date(req.body.targetDate) } }), 201));
export const updateGoal = asyncHandler(async (req, res) => {
  if (!(await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.user.id } }))) throw notFound();
  ok(res, await prisma.goal.update({ where: { id: req.params.id }, data: { ...req.body, ...(req.body.targetDate ? { targetDate: new Date(req.body.targetDate) } : {}) } }));
});
export const deleteGoal = asyncHandler(async (req, res) => {
  if (!(await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.user.id } }))) throw notFound();
  await prisma.goal.delete({ where: { id: req.params.id } }); ok(res, { deleted: true });
});

export const dashboard = asyncHandler(async (req, res) => ok(res, await dashboardSummary(req.user.id)));
export const cashFlowController = asyncHandler(async (req, res) => ok(res, await cashFlow(req.user.id, Math.min(Number(req.query.months || 6), 12))));
export const categoriesController = asyncHandler(async (req, res) => ok(res, await getCategorySpending(req.user.id)));
export const trendsController = asyncHandler(async (req, res) => ok(res, await trends(req.user.id, Math.min(Number(req.query.months || 6), 12))));
