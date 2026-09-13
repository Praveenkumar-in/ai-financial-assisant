import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/api.js";
import { answerFinanceQuestion } from "../services/ai/aiService.js";

export const chat = asyncHandler(async (req, res) => {
  let conversation;
  if (req.body.conversationId) {
    conversation = await prisma.aIConversation.findFirst({ where: { id: req.body.conversationId, userId: req.user.id } });
    if (!conversation) throw Object.assign(new Error("Conversation not found"), { statusCode: 404 });
  } else {
    conversation = await prisma.aIConversation.create({ data: { userId: req.user.id, title: req.body.message.slice(0, 50) } });
  }
  const history = await prisma.aIMessage.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "asc" }, take: 20 });
  await prisma.aIMessage.create({ data: { conversationId: conversation.id, role: "user", content: req.body.message } });
  const result = await answerFinanceQuestion(req.user.id, req.body.message, history);
  await prisma.aIMessage.create({ data: { conversationId: conversation.id, role: "assistant", content: result.answer } });
  ok(res, { conversationId: conversation.id, ...result });
});

export const conversations = asyncHandler(async (req, res) => ok(res, await prisma.aIConversation.findMany({
  where: { userId: req.user.id }, orderBy: { updatedAt: "desc" }, include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } }
})));

export const conversation = asyncHandler(async (req, res) => {
  const item = await prisma.aIConversation.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!item) throw Object.assign(new Error("Conversation not found"), { statusCode: 404 });
  ok(res, item);
});
