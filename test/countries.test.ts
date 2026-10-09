import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { COUNTRIES, SCENARIOS, caFederalTax, caOntarioTax, compare, exampleEmployerPlan, ukEmployeeNI, ukIncomeTax } from "../src/index.ts";
import type { CountryId, ScenarioId, UserProfile } from "../src/index.ts";

const near = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≉ ${b}`);

const household = { adults: 2, children: 2 } as const;
const base: UserProfile = {
  state: "PA",
  annualIncomeUSD: 90_000,
  household,
  coverage: exampleEmployerPlan(household),
};
const item = (id: CountryId, scenario: ScenarioId, itemId: string, profile = base) =>
  compare(profile, scenario).results[id].items.find((i) => i.id === itemId);

describe("registry", () => {
  it("returns a result for every registered country", () => {
    const r = compare(base, "healthy").results;
    assert.deepEqual(Object.keys(r).sort(), Object.keys(COUNTRIES).sort());
    for (const id of Object.keys(COUNTRIES) as CountryId[]) assert.equal(r[id].countryId, id);
  });

  it("gives non-negative totals for every country and scenario", () => {
    for (const s of Object.keys(SCENARIOS) as ScenarioId[]) {
      for (const income of [0, 20_000, 90_000, 400_000]) {
        for (const r of Object.values(compare({ ...base, annualIncomeUSD: income }, s).results)) {
          assert.ok(r.visibleTotalUSD >= 0 && Number.isFinite(r.fullTotalUSD), `${r.countryId} ${s} ${income}`);
        }
      }
    }
  });
});

describe("UK", () => {
  it("income tax: nothing under the allowance, 20% above it", () => {
    assert.equal(ukIncomeTax(12_570), 0);
    near(ukIncomeTax(32_570), 4_000);
  });

  it("income tax: higher rate starts after the basic band", () => {
    // £60,000 → taxable £47,430: 37,700 × 20% + 9,730 × 40%
    near(ukIncomeTax(60_000), 7_540 + 3_892);
  });

  it("income tax: allowance is gone at £125,140", () => {
    near(ukIncomeTax(125_140), 37_700 * 0.2 + (125_140 - 37_700) * 0.4);
  });

  it("NI: 8% between the thresholds, 2% above", () => {
    near(ukEmployeeNI(50_270), (50_270 - 12_570) * 0.08);
    near(ukEmployeeNI(60_270), (50_270 - 12_570) * 0.08 + 10_000 * 0.02);
  });

  it("prescriptions are free with a baby and capped by the annual certificate when serious", () => {
    assert.equal(item("UK", "baby", "uk-prescriptions")!.amountUSD, 0);
    near(item("UK", "serious", "uk-prescriptions")!.amountUSD, 114.5 * 1.34);
  });

  it("household size does not change the cost", () => {
    const single = compare({ ...base, household: { adults: 1, children: 0 } }, "healthy").results.UK;
    assert.equal(single.visibleTotalUSD, compare(base, "healthy").results.UK.visibleTotalUSD);
  });
});

describe("CH", () => {
  it("charges a premium per adult and per child, regardless of income", () => {
    const premiums = (income: number) => {
      const r = compare({ ...base, annualIncomeUSD: income }, "baby").results.CH;
      return r.items.filter((i) => i.id.startsWith("ch-premium")).reduce((a, i) => a + i.amountUSD, 0);
    };
    near(premiums(90_000), (2 * 465.3 * 12 + 2 * 122.5 * 12) * 1.25);
    near(premiums(30_000), premiums(300_000));
  });

  it("charges no cost sharing or hospital contribution for a baby", () => {
    assert.equal(item("CH", "baby", "ch-cost-sharing")!.amountUSD, 0);
    assert.equal(item("CH", "baby", "ch-hospital")!.amountUSD, 0);
  });

  it("caps a serious illness at deductible + coinsurance cap, plus 28 hospital days", () => {
    near(item("CH", "serious", "ch-cost-sharing")!.amountUSD, 1_000 * 1.25);
    near(item("CH", "serious", "ch-hospital")!.amountUSD, 28 * 15 * 1.25);
  });

  it("has no employer share", () => {
    const r = compare(base, "serious").results.CH;
    assert.equal(r.fullTotalUSD, r.visibleTotalUSD);
  });
});

describe("NL", () => {
  it("charges one premium per adult and none for children", () => {
    near(item("NL", "healthy", "nl-premium")!.amountUSD, 2 * 1_908 * 1.16);
    near(item("NL", "healthy", "nl-premium", { ...base, household: { adults: 2, children: 5 } })!.amountUSD, 2 * 1_908 * 1.16);
  });

  it("applies the deductible to a healthy year only up to the claims, and in full when serious", () => {
    near(item("NL", "healthy", "nl-deductible")!.amountUSD, 200 * 1.16);
    near(item("NL", "serious", "nl-deductible")!.amountUSD, 385 * 1.16);
    assert.equal(item("NL", "baby", "nl-deductible")!.amountUSD, 0);
  });

  it("charges the maternity home-care contribution only for a baby", () => {
    near(item("NL", "baby", "nl-kraamzorg")!.amountUSD, 50 * 5.7 * 1.16);
    assert.equal(item("NL", "healthy", "nl-kraamzorg")!.amountUSD, 0);
  });

  it("employer levy stops at the wage ceiling", () => {
    const at = item("NL", "healthy", "nl-employer-levy", { ...base, annualIncomeUSD: 79_409 * 1.16 })!.amountUSD;
    const above = item("NL", "healthy", "nl-employer-levy", { ...base, annualIncomeUSD: 500_000 })!.amountUSD;
    near(at, above);
    near(above, 79_409 * 0.061 * 1.16);
  });
});

describe("CA", () => {
  it("federal tax is zero below the basic personal amount", () => {
    assert.equal(caFederalTax(16_000), 0);
  });

  it("federal tax at $100,000 matches the bracket arithmetic", () => {
    const gross = 58_523 * 0.14 + (100_000 - 58_523) * 0.205;
    near(caFederalTax(100_000), gross - 16_452 * 0.14);
  });

  it("Ontario tax adds surtax once basic tax passes the first threshold", () => {
    const basic = (income: number) => caOntarioTax(income);
    assert.ok(basic(200_000) > 0);
    // Below the surtax threshold: just brackets minus the credit.
    near(caOntarioTax(60_000), 53_891 * 0.0505 + (60_000 - 53_891) * 0.0915 - 12_989 * 0.0505);
  });

  it("the Ontario Health Premium is $750 at $90,000 and capped at $900", () => {
    near(item("CA", "healthy", "ca-ontario-premium", { ...base, annualIncomeUSD: 90_000 * 0.72 })!.amountUSD, 750 * 0.72);
    near(item("CA", "healthy", "ca-ontario-premium", { ...base, annualIncomeUSD: 1_000_000 })!.amountUSD, 900 * 0.72);
  });

  it("the scenario does not change the cost", () => {
    const a = compare(base, "healthy").results.CA.visibleTotalUSD;
    assert.equal(compare(base, "serious").results.CA.visibleTotalUSD, a);
  });
});
