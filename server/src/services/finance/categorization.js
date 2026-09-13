import { prisma } from "../../config/prisma.js";

const RULES = [
  [/swiggy|zomato|restaurant|cafe|food|domino|pizza/i, "Food"],
  [/uber|ola|rapido|metro|bus|fuel|petrol|shell/i, "Transport"],
  [/amazon|flipkart|myntra|shopping|mall/i, "Shopping"],
  [/netflix|spotify|prime video|movie|cinema|entertainment/i, "Entertainment"],
  [/electricity|bescom|tneb|eb bill|water bill|mobile|airtel|jio|vodafone/i, "Bills"],
  [/rent|lease/i, "Rent"],
  [/hospital|pharmacy|apollo|medic|health/i, "Healthcare"],
  [/school|college|course|education|udemy|coursera/i, "Education"],
  [/salary|payroll|income|bonus/i, "Salary"],
  [/insurance/i, "Insurance"],
  [/loan|emi/i, "Loan"],
  [/mutual fund|stock|investment|zerodha|groww/i, "Investment"]
];

export async function categorize(transaction) {
  for (const [regex, category] of RULES) {
    if (regex.test(transaction.description || "")) {
      return { category, confidence: 0.98, reason: "Matched a trusted merchant/description rule." };
    }
  }
  return { category: "Other", confidence: 0.55, reason: "No high-confidence merchant rule matched; classified as Other." };
}

export async function applyCategorization(transactionId, userId) {
  const tx = await prisma.transaction.findFirst({ where: { id: transactionId, userId } });
  if (!tx) throw new Error("Transaction not found");
  const result = await categorize(tx);
  const category = await prisma.category.findUnique({ where: { name: result.category } });
  return prisma.transaction.update({
    where: { id: transactionId },
    data: { categoryId: category?.id, categoryConfidence: result.confidence, categoryReason: result.reason }
  });
}
