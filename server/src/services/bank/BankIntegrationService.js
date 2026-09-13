import { prisma } from "../../config/prisma.js";
import { MockBankProvider } from "./MockBankProvider.js";
import { categorize } from "../finance/categorization.js";

const provider = new MockBankProvider();

export async function createConsent(userId, accountId) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) throw Object.assign(new Error("Account not found"), { statusCode: 404 });
  const result = await provider.createConsent({ userId, accountId });
  return prisma.consent.create({
    data: {
      userId, accountId, provider: result.provider, externalId: result.externalId,
      status: result.status === "ACTIVE" ? "ACTIVE" : "PENDING"
    }
  });
}

export async function getConsentStatus(userId, consentId) {
  const consent = await prisma.consent.findFirst({ where: { id: consentId, userId } });
  if (!consent) throw Object.assign(new Error("Consent not found"), { statusCode: 404 });
  const result = await provider.getConsentStatus({ externalId: consent.externalId });
  return prisma.consent.update({ where: { id: consent.id }, data: { status: result.status } });
}

export async function handleCallback(userId, payload) {
  await provider.handleCallback(payload);
  return { received: true, userId };
}

export async function syncTransactions(userId, accountId) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) throw Object.assign(new Error("Account not found"), { statusCode: 404 });
  const incoming = await provider.syncTransactions({ accountId });
  const categories = await prisma.category.findMany();
  const map = new Map(categories.map(c => [c.name, c.id]));
  let imported = 0;
  for (const tx of incoming) {
    const exists = await prisma.transaction.findFirst({ where: { userId, externalId: tx.externalId } });
    if (exists) continue;
    const cat = await categorize(tx);
    await prisma.transaction.create({
      data: {
        userId, accountId, externalId: tx.externalId, date: tx.date,
        description: tx.description, amount: tx.amount, type: tx.type,
        categoryId: map.get(cat.category), categoryConfidence: cat.confidence,
        categoryReason: cat.reason, notes: tx.notes, source: "mock-bank"
      }
    });
    imported++;
  }
  await prisma.account.update({ where: { id: accountId }, data: { isConnected: true } });
  return { imported, provider: "mock", note: "Development-only generated transactions; not a real bank connection." };
}

export async function disconnectAccount(userId, accountId) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) throw Object.assign(new Error("Account not found"), { statusCode: 404 });
  await provider.disconnectAccount({ accountId });
  await prisma.consent.updateMany({ where: { accountId, userId }, data: { status: "REVOKED" } });
  return prisma.account.update({ where: { id: accountId }, data: { isConnected: false } });
}
