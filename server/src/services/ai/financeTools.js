import {
  getMonthlyIncome, getMonthlyExpenses, getCategorySpending, getTransactionSummary,
  getBudgetStatus, getGoalProgress, getAccountBalances, compareMonths, calculateSavingsRate
} from "../finance/calculations.js";

export const financeTools = {
  getMonthlyIncome: (userId) => getMonthlyIncome(userId),
  getMonthlyExpenses: (userId) => getMonthlyExpenses(userId),
  getCategorySpending: (userId) => getCategorySpending(userId),
  getTransactionSummary: (userId, args) => getTransactionSummary(userId, args),
  getBudgetStatus: (userId) => getBudgetStatus(userId),
  getGoalProgress: (userId) => getGoalProgress(userId),
  getAccountBalances: (userId) => getAccountBalances(userId),
  compareMonths: (userId) => compareMonths(userId),
  calculateSavingsRate: (userId) => calculateSavingsRate(userId)
};

export const toolDefinitions = [
  { name: "getMonthlyIncome", description: "Get authenticated user's current-month income.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getMonthlyExpenses", description: "Get authenticated user's current-month expenses.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getCategorySpending", description: "Get authenticated user's current-month expense totals by category.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getBudgetStatus", description: "Get authenticated user's current-month budget status.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getGoalProgress", description: "Get authenticated user's financial goals and progress.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "getAccountBalances", description: "Get authenticated user's account balances.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "compareMonths", description: "Compare authenticated user's current and previous month.", parameters: { type: "object", properties: {}, additionalProperties: false } },
  { name: "calculateSavingsRate", description: "Calculate authenticated user's current-month savings and savings rate.", parameters: { type: "object", properties: {}, additionalProperties: false } }
];

export async function runApprovedTools(userId, intent) {
  const calls = [];
  const add = async (name, fn) => calls.push({ tool: name, data: await fn(userId) });

  if (intent === "spending" || intent === "food" || intent === "biggest") {
    await add("getMonthlyExpenses", financeTools.getMonthlyExpenses);
    await add("getCategorySpending", financeTools.getCategorySpending);
  } else if (intent === "budget") {
    await add("getBudgetStatus", financeTools.getBudgetStatus);
    await add("getCategorySpending", financeTools.getCategorySpending);
  } else if (intent === "goal") {
    await add("getGoalProgress", financeTools.getGoalProgress);
    await add("calculateSavingsRate", financeTools.calculateSavingsRate);
  } else if (intent === "compare") {
    await add("compareMonths", financeTools.compareMonths);
  } else if (intent === "save") {
    await add("calculateSavingsRate", financeTools.calculateSavingsRate);
    await add("getBudgetStatus", financeTools.getBudgetStatus);
  } else if (intent === "balance") {
    await add("getAccountBalances", financeTools.getAccountBalances);
  } else {
    await add("getMonthlyIncome", financeTools.getMonthlyIncome);
    await add("getMonthlyExpenses", financeTools.getMonthlyExpenses);
    await add("getCategorySpending", financeTools.getCategorySpending);
    await add("calculateSavingsRate", financeTools.calculateSavingsRate);
  }
  return calls;
}

export function detectIntent(message) {
  const q = message.toLowerCase();
  if (/food/.test(q)) return "food";
  if (/budget/.test(q)) return "budget";
  if (/goal|vacation|emergency fund|phone|car|house/.test(q)) return "goal";
  if (/compare|last month|previous month/.test(q)) return "compare";
  if (/save|savings|afford/.test(q)) return "save";
  if (/balance|how much money|accounts?/.test(q)) return "balance";
  if (/biggest|highest|reduce|spend|expense/.test(q)) return "spending";
  return "general";
}
