import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compare, compareAll, exampleEmployerPlan, summarize } from "../src/index.ts";
import type { UserProfile } from "../src/index.ts";

const household = { adults: 2, children: 2 } as const;
const profile = (annualIncomeUSD: number): UserProfile => ({
  state: "PA",
  annualIncomeUSD,
  household,
  coverage: exampleEmployerPlan(household),
});

describe("compareAll", () => {
  it("matches compare() for each scenario", () => {
    const all = compareAll(profile(75_000));
    for (const s of ["healthy", "baby", "serious"] as const) {
      assert.deepEqual(all[s], compare(profile(75_000), s).results);
    }
  });
});

describe("summarize", () => {
  it("reports the US spread and the range elsewhere", () => {
    const all = compareAll(profile(75_000));
    const s = summarize(all, false);
    assert.equal(s.usSpreadUSD, all.serious.US.visibleTotalUSD - all.healthy.US.visibleTotalUSD);
    assert.ok(s.otherSpreadMinUSD <= s.otherSpreadMaxUSD);
    assert.equal(s.otherCount, 5);
  });

  it("counts countries cheaper than the US, and that count moves with income", () => {
    const low = summarize(compareAll(profile(40_000)), false);
    const high = summarize(compareAll(profile(400_000)), false);
    assert.ok(low.cheaperThanUS.healthy >= 0 && low.cheaperThanUS.healthy <= low.otherCount);
    // Tax-funded estimates and German contributions grow with income, so fewer countries beat the US.
    assert.ok(high.cheaperThanUS.healthy < low.cheaperThanUS.healthy);
  });

  it("does not change the spread when employer shares are included", () => {
    const all = compareAll(profile(75_000));
    assert.equal(summarize(all, true).usSpreadUSD, summarize(all, false).usSpreadUSD);
  });
});
