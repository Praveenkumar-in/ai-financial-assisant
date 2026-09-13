import { BankProvider } from "./BankProvider.js";

export class AccountAggregatorProvider extends BankProvider {
  // TODO: Configure production AA client credentials, certificates and secure key storage.
  async createConsent() {
    // TODO: Call the selected Account Aggregator/FIP consent API using provider-specific contracts.
    throw new Error("Account Aggregator provider is not configured");
  }

  async getConsentStatus() {
    // TODO: Query provider consent status and validate the consent artefact.
    throw new Error("Account Aggregator provider is not configured");
  }

  async requestFinancialInformation() {
    // TODO: Request FI data using the approved consent handle.
    throw new Error("Account Aggregator provider is not configured");
  }

  async handleCallback() {
    // TODO: Validate callback signature, certificates, nonce/state and provider response.
    throw new Error("Account Aggregator provider is not configured");
  }

  async syncTransactions() {
    // TODO: Decrypt and normalize provider-specific FI data into FinanceAI transactions.
    throw new Error("Account Aggregator provider is not configured");
  }

  async disconnectAccount() {
    // TODO: Revoke provider consent and securely delete provider-specific artifacts.
    throw new Error("Account Aggregator provider is not configured");
  }
}
