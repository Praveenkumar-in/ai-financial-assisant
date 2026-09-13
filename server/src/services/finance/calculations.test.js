import { describe, it, expect } from "vitest";
import { calculateSavingsRate } from "./calculations.js";

describe("financial calculations", () => {
  it("exports a savings calculation function", () => {
    expect(typeof calculateSavingsRate).toBe("function");
  });
});
