import { describe, expect, it } from "vitest";

import {
  calculateTotalCompensation,
} from "../lib/utils/compensation";

import {
  normalizeCompanyName,
  normalizeRoleName,
  normalizeLevelName,
  normalizeLocation,
} from "../lib/utils/normalization";

import {
  compensationSchema,
} from "../lib/validation/compensation.schema";

describe("Compensation calculation", () => {
  it("calculates total compensation correctly", () => {
    expect(
      calculateTotalCompensation(
        1_000_000,
        200_000,
        100_000,
      ),
    ).toBe(1_300_000);
  });

  it("defaults stock and bonus to zero", () => {
    expect(
      calculateTotalCompensation(1_000_000),
    ).toBe(1_000_000);
  });

  it("handles zero stock with a bonus", () => {
    expect(
      calculateTotalCompensation(
        1_000_000,
        0,
        50_000,
      ),
    ).toBe(1_050_000);
  });
});

describe("Compensation validation", () => {
  it("accepts a valid compensation record", () => {
    const result = compensationSchema.safeParse({
      company: "Google",
      role: "Software Engineer",
      level: "L5",
      city: "Bangalore",
      country: "India",
      baseSalary: 2_500_000,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.stock).toBe(0);
      expect(result.data.bonus).toBe(0);
      expect(result.data.currency).toBe("INR");
    }
  });

  it("rejects negative base salary", () => {
    const result = compensationSchema.safeParse({
      company: "Google",
      role: "Software Engineer",
      level: "L5",
      city: "Bangalore",
      country: "India",
      baseSalary: -100_000,
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = compensationSchema.safeParse({
      company: "Google",
      baseSalary: 2_500_000,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid salary values", () => {
    const result = compensationSchema.safeParse({
      company: "Google",
      role: "Software Engineer",
      level: "L5",
      city: "Bangalore",
      country: "India",
      baseSalary: Infinity,
    });

    expect(result.success).toBe(false);
  });
});

describe("Data normalization", () => {
  it("normalizes company names", () => {
    expect(
      normalizeCompanyName("  Google  "),
    ).toBe("google");

    expect(
      normalizeCompanyName("Microsoft!!!"),
    ).toBe("microsoft");
  });

  it("normalizes role names", () => {
    expect(
      normalizeRoleName(
        "  Senior   Software Engineer  ",
      ),
    ).toBe("senior software engineer");
  });

  it("normalizes level names", () => {
    expect(
      normalizeLevelName("  L5  "),
    ).toBe("l5");
  });

  it("normalizes location fields", () => {
    expect(
      normalizeLocation(
        "  Bangalore ",
        " India ",
      ),
    ).toEqual({
      city: "Bangalore",
      country: "India",
    });
  });
});