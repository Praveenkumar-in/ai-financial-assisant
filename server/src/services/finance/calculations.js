import { prisma } from "../../config/prisma.js";

const n = (v) => Number(v || 0);

function monthBounds(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

export async function getMonthlyIncome(userId, offset = 0) {
  const { start, end } = monthBounds(offset);
  const rows = await prisma.transaction.aggregate({
    where: { userId, type: "INCOME", date: { gte: start, lt: end } },
    _sum: { amount: true }
  });
  return n(rows._sum.amount);
}

export async function getMonthlyExpenses(userId, offset = 0) {
  const { start, end } = monthBounds(offset);
  const rows = await prisma.transaction.aggregate({
    where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
    _sum: { amount: true }
  });
  return n(rows._sum.amount);
}

export async function getCategorySpending(userId, offset = 0) {
  const { start, end } = monthBounds(offset);
  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
    _sum: { amount: true }
  });
  const categories = await prisma.category.findMany();
  const map = new Map(categories.map(c => [c.id, c.name]));
  return rows
    .map(r => ({ category: map.get(r.categoryId) || "Other", amount: n(r._sum.amount) }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getTransactionSummary(userId, { from, to, type, category } = {}) {
  const where = { userId };
  if (from || to) where.date = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lt: new Date(to) } : {}) };
  if (type) where.type = type;
  if (category) {
    const c = await prisma.category.findUnique({ where: { name: category } });
    where.categoryId = c?.id || "__none__";
  }
  const [count, sums] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.aggregate({ where, _sum: { amount: true } })
  ]);
  return { count, total: n(sums._sum.amount) };
}

export async function getBudgetStatus(userId) {
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth(), 1);
  const budget = await prisma.budget.findUnique({
    where: { userId_month: { userId, month } },
    include: { categories: { include: { category: true } } }
  });
  if (!budget) return [];
  const spent = await getCategorySpending(userId);
  const spentMap = new Map(spent.map(x => [x.category, x.amount]));
  return budget.categories.map(b => {
    const amount = n(b.amount);
    const spentAmount = spentMap.get(b.category.name) || 0;
    return {
      category: b.category.name,
      budget: amount,
      spent: spentAmount,
      remaining: amount - spentAmount,
      percentage: amount ? Math.round((spentAmount / amount) * 100) : 0,
      status: spentAmount > amount ? "Exceeded" : spentAmount >= amount * 0.8 ? "Warning" : "Normal"
    };
  });
}

export async function getGoalProgress(userId) {
  const goals = await prisma.goal.findMany({ where: { userId }, orderBy: { targetDate: "asc" } });
  return goals.map(g => {
    const target = n(g.targetAmount);
    const current = n(g.currentAmount);
    const remaining = Math.max(0, target - current);
    const monthly = n(g.monthlyContribution);
    const percentage = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const months = monthly > 0 ? Math.ceil(remaining / monthly) : null;
    const estimated = months == null ? null : new Date(new Date().getFullYear(), new Date().getMonth() + months, 1);
    return { ...g, targetAmount: target, currentAmount: current, remaining, monthlyContribution: monthly, percentage, estimatedCompletionDate: estimated };
  });
}

export async function getAccountBalances(userId) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" }
  });
  return accounts.map(a => ({ id: a.id, name: a.name, type: a.type, balance: n(a.balance), currency: a.currency, maskedNumber: a.maskedNumber, isConnected: a.isConnected }));
}

export async function compareMonths(userId) {
  const [incomeNow, incomePrev, expensesNow, expensesPrev] = await Promise.all([
    getMonthlyIncome(userId, 0), getMonthlyIncome(userId, -1),
    getMonthlyExpenses(userId, 0), getMonthlyExpenses(userId, -1)
  ]);
  return {
    current: { income: incomeNow, expenses: expensesNow, savings: incomeNow - expensesNow },
    previous: { income: incomePrev, expenses: expensesPrev, savings: incomePrev - expensesPrev },
    expenseChangePercent: expensesPrev ? ((expensesNow - expensesPrev) / expensesPrev) * 100 : null
  };
}

export async function calculateSavingsRate(userId) {
  const [income, expenses] = await Promise.all([getMonthlyIncome(userId), getMonthlyExpenses(userId)]);
  return { income, expenses, savings: income - expenses, rate: income ? ((income - expenses) / income) * 100 : 0 };
}

export async function dashboardSummary(userId) {
  const [accounts, income, expenses, budgets, goals, categorySpending] = await Promise.all([
    getAccountBalances(userId), getMonthlyIncome(userId), getMonthlyExpenses(userId),
    getBudgetStatus(userId), getGoalProgress(userId), getCategorySpending(userId)
  ]);
  return {
    totalBalance: accounts.reduce((s, a) => s + a.balance, 0),
    monthlyIncome: income,
    monthlyExpenses: expenses,
    monthlySavings: income - expenses,
    savingsPercentage: income ? ((income - expenses) / income) * 100 : 0,
    connectedAccounts: accounts.filter(a => a.isConnected).length,
    activeBudgets: budgets.length,
    activeGoals: goals.length,
    topCategory: categorySpending[0] || null
  };
}

export async function cashFlow(userId, months = 6) {
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString("en-IN", { month: "short" });
    const [income, expenses] = await Promise.all([getMonthlyIncome(userId, -i), getMonthlyExpenses(userId, -i)]);
    result.push({ month: label, income, expenses, savings: income - expenses });
  }
  return result;
}

export async function trends(userId, months = 6) {
  return cashFlow(userId, months);
}
