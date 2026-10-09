import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { costSharing, compare, exampleEmployerPlan } from "../src/index.ts";
import type { UserProfile } from "../src/index.ts";

const plan = { deductible: 2_000, coinsurance: 0.2, oopMax: 5_000 };

describe("costSharing", () => {
  it("charges nothing for no claims", () => {
    assert.deepEqual(costSharing(0, plan), { deductiblePaid: 0, coinsurancePaid: 0, total: 0, hitOopMax: false });
  });

  it("charges the full amount below the deductible", () => {
    const r = costSharing(1_200, plan);
    assert.equal(r.total, 1_200);
    assert.equal(r.coinsurancePaid, 0);
  });

  it("applies coinsurance above the deductible", () => {
    const r = costSharing(7_000, plan); // 2,000 + 5,000 × 20%
    assert.equal(r.deductiblePaid, 2_000);
    assert.equal(r.coinsurancePaid, 1_000);
    assert.equal(r.total, 3_000);
    assert.equal(r.hitOopMax, false);
  });

  it("stops at the out-of-pocket maximum", () => {
    const r = costSharing(1_000_000, plan);
    assert.equal(r.total, 5_000);
    assert.equal(r.hitOopMax, true);
  });

  it("reaches the maximum exactly at the boundary", () => {
    const r = costSharing(17_000, plan); // 2,000 + 15,000 × 20% = 5,000
    assert.equal(r.total, 5_000);
    assert.equal(r.hitOopMax, true);
  });

  it("handles a deductible larger than the OOP max without overcharging", () => {
    const r = costSharing(10_000, { deductible: 8_000, coinsurance: 0.2, oopMax: 6_000 });
    assert.equal(r.total, 6_000);
    assert.equal(r.deductiblePaid + r.coinsurancePaid, r.total);
  });

  it("rejects negative claims", () => {
    assert.throws(() => costSharing(-1, plan), RangeError);
  });
});

describe("US model with the example plan (single, $80k)", () => {
  const profile: UserProfile = {
    state: "PA",
    annualIncomeUSD: 80_000,
    household: { adults: 1, children: 0 },
    coverage: exampleEmployerPlan({ adults: 1, children: 0 }),
  };

  it("builds the example plan from KFF averages", () => {
    assert.equal(profile.coverage.employeePremium, 1_492); // 9,325 × 16%
    assert.equal(profile.coverage.employerPremium, 7_833);
  });

  it("healthy year: premium plus claims under the deductible", () => {
    const us = compare(profile, "healthy").results.US;
    assert.equal(us.visibleTotalUSD, 1_492 + 1_500);
  });

  it("baby: premium plus deductible plus coinsurance", () => {
    const us = compare(profile, "baby").results.US;
    // 1,886 + (20,416 − 1,886) × 20% = 5,592
    assert.equal(us.visibleTotalUSD, 1_492 + 5_592);
  });

  it("serious illness: hits the 2026 ACA limit", () => {
    const us = compare(profile, "serious").results.US;
    assert.equal(us.visibleTotalUSD, 1_492 + 10_600);
    assert.equal(us.fullTotalUSD, 1_492 + 10_600 + 7_833);
  });

  it("warns when the employer share is unknown", () => {
    const { employerPremium: _omit, ...rest } = profile.coverage;
    const us = compare({ ...profile, coverage: rest }, "healthy").results.US;
    assert.equal(us.fullTotalUSD, us.visibleTotalUSD);
    assert.equal(us.warnings.length, 1);
  });
});
