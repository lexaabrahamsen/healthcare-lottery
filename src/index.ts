import type { ComparisonResult, ScenarioId, UserProfile } from "./types.ts";
import { SCENARIOS } from "./data/scenarios.ts";
import { COUNTRIES } from "./countries.ts";

export * from "./types.ts";
export { SOURCES, getSource } from "./sources.ts";
export { SCENARIOS } from "./data/scenarios.ts";
export { exampleEmployerPlan } from "./data/us-2026.ts";
export { costSharing } from "./models/us.ts";
export { gkvContribution, copayCapEUR } from "./models/de.ts";
export { ukIncomeTax, ukEmployeeNI, ukEmployerNI } from "./models/uk.ts";
export { caFederalTax, caOntarioTax } from "./models/ca.ts";
export { COUNTRIES } from "./countries.ts";
export { compareAll, splitCosts, summarize } from "./insights.ts";
export type { AllResults, CostSplit, Summary } from "./insights.ts";
export type { CountryModel, FundingModel } from "./countries.ts";

export function compare(profile: UserProfile, scenarioId: ScenarioId): ComparisonResult {
  validate(profile);
  const scenario = SCENARIOS[scenarioId];
  return {
    profile,
    scenario,
    results: Object.fromEntries(
      Object.values(COUNTRIES).map((c) => [c.id, c.compute(profile, scenario)]),
    ) as ComparisonResult["results"],
  };
}

export function validate(p: UserProfile): void {
  const errors: string[] = [];
  if (!(p.annualIncomeUSD >= 0)) errors.push("annualIncomeUSD must be a non-negative number");
  if (!Number.isInteger(p.household.children) || p.household.children < 0) errors.push("children must be a whole number ≥ 0");
  const c = p.coverage;
  if (c.coinsurance < 0 || c.coinsurance > 1) errors.push("coinsurance must be between 0 and 1");
  for (const k of ["employeePremium", "deductible", "oopMax"] as const) {
    if (!(c[k] >= 0)) errors.push(`${k} must be a non-negative number`);
  }
  if (errors.length) throw new RangeError(errors.join("; "));
}
