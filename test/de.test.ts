import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compare, copayCapEUR, exampleEmployerPlan, gkvContribution } from "../src/index.ts";
import type { UserProfile } from "../src/index.ts";

const near = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

describe("gkvContribution", () => {
  it("charges each side half of 14.6% + 2.9% below the ceiling", () => {
    const c = gkvContribution(40_000);
    near(c.employeeEUR, 40_000 * 0.0875);
    near(c.employerEUR, c.employeeEUR);
    assert.equal(c.cappedAtCeiling, false);
  });

  it("stops rising at the €69,750 ceiling", () => {
    const atCeiling = gkvContribution(69_750);
    const above = gkvContribution(250_000);
    near(above.employeeEUR, atCeiling.employeeEUR);
    near(above.employeeEUR, 69_750 * 0.0875); // €6,103.13
    assert.equal(above.cappedAtCeiling, true);
  });

  it("is zero for zero income", () => {
    assert.equal(gkvContribution(0).employeeEUR, 0);
  });
});

describe("copayCapEUR", () => {
  it("is 2% of income for a single person", () => {
    near(copayCapEUR(50_000, { adults: 1, children: 0 }), 1_000);
  });

  it("subtracts 2026 allowances for a spouse and each child", () => {
    // BARMER's worked example uses €45,000 with a spouse and two children: base €18,369.
    near(copayCapEUR(45_000, { adults: 2, children: 2 }), 18_369 * 0.02);
  });

  it("never goes below zero", () => {
    assert.equal(copayCapEUR(10_000, { adults: 2, children: 3 }), 0);
  });
});

describe("DE model", () => {
  const base: UserProfile = {
    state: "PA",
    annualIncomeUSD: 80_000,
    household: { adults: 1, children: 0 },
    coverage: exampleEmployerPlan({ adults: 1, children: 0 }),
  };

  it("below the ceiling, the USD contribution is 8.75% of USD income regardless of exchange rate", () => {
    const de = compare(base, "healthy").results.DE;
    const employee = de.items.find((i) => i.id === "de-contribution-employee")!;
    near(employee.amountUSD, 7_000);
  });

  it("charges no copays for having a baby", () => {
    const de = compare(base, "baby").results.DE;
    assert.equal(de.items.find((i) => i.id === "de-copays")!.amountUSD, 0);
  });

  it("serious illness copays stay under the cap", () => {
    const de = compare(base, "serious").results.DE;
    near(de.items.find((i) => i.id === "de-copays")!.amountUSD, 480 * 1.16);
  });

  it("caps copays for a low-income family", () => {
    const de = compare({ ...base, annualIncomeUSD: 30_000, household: { adults: 2, children: 1 } }, "serious").results.DE;
    const copays = de.items.find((i) => i.id === "de-copays")!;
    const capUSD = copayCapEUR(30_000 / 1.16, { adults: 2, children: 1 }) * 1.16;
    assert.ok(capUSD < 480 * 1.16);
    near(copays.amountUSD, capUSD);
  });

  it("does not charge more for a larger family", () => {
    const single = compare(base, "healthy").results.DE;
    const family = compare({ ...base, household: { adults: 2, children: 3 } }, "healthy").results.DE;
    const contribution = (r: typeof single) => r.items.find((i) => i.id === "de-contribution-employee")!.amountUSD;
    assert.equal(contribution(family), contribution(single));
  });

  it("warns above the mandatory-insurance threshold", () => {
    const de = compare({ ...base, annualIncomeUSD: 120_000 }, "healthy").results.DE;
    assert.equal(de.warnings.length, 1);
  });
});
