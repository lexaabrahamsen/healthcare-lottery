import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SCENARIOS, SOURCES, compare, exampleEmployerPlan } from "../src/index.ts";
import type { ScenarioId, UserProfile } from "../src/index.ts";

const profiles: UserProfile[] = [
  { state: "PA", annualIncomeUSD: 35_000, household: { adults: 1, children: 0 }, coverage: exampleEmployerPlan({ adults: 1, children: 0 }) },
  { state: "TX", annualIncomeUSD: 90_000, household: { adults: 2, children: 2 }, coverage: exampleEmployerPlan({ adults: 2, children: 2 }) },
  { state: "OH", annualIncomeUSD: 250_000, household: { adults: 2, children: 0 }, coverage: exampleEmployerPlan({ adults: 2, children: 0 }) },
];

describe("integrity", () => {
  it("every line item input points to a registered source", () => {
    for (const p of profiles) {
      for (const id of Object.keys(SCENARIOS) as ScenarioId[]) {
        for (const r of Object.values(compare(p, id).results)) {
          for (const item of r.items) {
            for (const [name, input] of Object.entries(item.derivation.inputs)) {
              assert.ok(SOURCES[input.sourceId], `${r.countryId}/${item.id}/${name} → unknown source "${input.sourceId}"`);
            }
          }
        }
      }
    }
  });

  it("totals equal the sum of their line items", () => {
    for (const p of profiles) {
      for (const id of Object.keys(SCENARIOS) as ScenarioId[]) {
        for (const r of Object.values(compare(p, id).results)) {
          const you = r.items.filter((i) => i.paidBy === "you").reduce((a, i) => a + i.amountUSD, 0);
          const all = r.items.reduce((a, i) => a + i.amountUSD, 0);
          assert.ok(Math.abs(r.visibleTotalUSD - you) < 0.01);
          assert.ok(Math.abs(r.fullTotalUSD - all) < 0.01);
          assert.ok(r.fullTotalUSD >= r.visibleTotalUSD);
        }
      }
    }
  });

  it("every non-user source has a label, and every external one a URL", () => {
    for (const s of Object.values(SOURCES)) {
      assert.ok(s.label.length > 0);
      if (s.kind === "primary" || s.kind === "research") assert.ok(s.url, `${s.id} has no URL`);
    }
  });

  it("rejects invalid profiles", () => {
    const bad = { ...profiles[0]!, coverage: { ...profiles[0]!.coverage, coinsurance: 1.5 } };
    assert.throws(() => compare(bad, "healthy"), RangeError);
  });
});
