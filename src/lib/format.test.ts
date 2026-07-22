import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatPercent,
  formatPrice,
  relativeTime,
} from "./format.ts";

describe("formatCompactCurrency", () => {
  it("abbreviates trillions", () => {
    expect(formatCompactCurrency(1.234e12)).toBe("$1.23T");
  });
  it("abbreviates billions", () => {
    expect(formatCompactCurrency(890.4e9)).toBe("$890.4B");
  });
  it("abbreviates millions", () => {
    expect(formatCompactCurrency(12_340_000)).toBe("$12.34M");
  });
  it("keeps small values plain", () => {
    expect(formatCompactCurrency(950)).toBe("$950");
  });
});

describe("formatPrice", () => {
  it("uses two decimals at or above $1", () => {
    expect(formatPrice(118250.1234)).toBe("$118,250.12");
    expect(formatPrice(1)).toBe("$1.00");
  });
  it("uses significant digits below $1", () => {
    expect(formatPrice(0.2381)).toBe("$0.2381");
    expect(formatPrice(0.00001402)).toBe("$0.00001402");
  });
  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("formatPercent", () => {
  it("marks gains with direction up", () => {
    expect(formatPercent(2.5)).toEqual({ text: "2.50%", direction: "up" });
  });
  it("marks losses with direction down and absolute text", () => {
    expect(formatPercent(-3.2)).toEqual({ text: "3.20%", direction: "down" });
  });
  it("treats ~zero as flat", () => {
    expect(formatPercent(0).direction).toBe("flat");
  });
  it("handles null/undefined as flat em dash", () => {
    expect(formatPercent(undefined)).toEqual({ text: "—", direction: "flat" });
  });
});

describe("relativeTime", () => {
  const now = Date.now();
  it("renders minutes", () => {
    expect(relativeTime(now - 5 * 60_000, now)).toBe("5m ago");
  });
  it("renders hours", () => {
    expect(relativeTime(now - 2 * 3_600_000, now)).toBe("2h ago");
  });
  it("renders days", () => {
    expect(relativeTime(now - 3 * 86_400_000, now)).toBe("3d ago");
  });
  it("renders just now for <1m", () => {
    expect(relativeTime(now - 20_000, now)).toBe("just now");
  });
});
