import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/api.js";
import * as bank from "../services/bank/BankIntegrationService.js";

export const connect = asyncHandler(async (req, res) => ok(res, await bank.createConsent(req.user.id, req.body.accountId), 201));
export const consent = asyncHandler(async (req, res) => ok(res, await bank.getConsentStatus(req.user.id, req.params.id)));
export const callback = asyncHandler(async (req, res) => ok(res, await bank.handleCallback(req.user.id, req.body)));
export const sync = asyncHandler(async (req, res) => ok(res, await bank.syncTransactions(req.user.id, req.params.accountId)));
export const disconnect = asyncHandler(async (req, res) => ok(res, await bank.disconnectAccount(req.user.id, req.params.accountId)));
