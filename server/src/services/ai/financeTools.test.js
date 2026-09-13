import { describe, it, expect } from "vitest";
import { detectIntent } from "./financeTools.js";

describe("AI intent detection", () => {
  it("detects food spending", () => expect(detectIntent("How much did I spend on food?")).toBe("food"));
  it("detects goals", () => expect(detectIntent("Am I on track for my vacation goal?")).toBe("goal"));
  it("detects comparison", () => expect(detectIntent("Compare this month with last month")).toBe("compare"));
});
