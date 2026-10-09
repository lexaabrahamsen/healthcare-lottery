import type { EmployerPlan, Household, Sourced } from "../types.ts";

/** KFF 2025 EHBS averages, the latest published at time of writing. */
export const US_EMPLOYER_AVERAGES = {
  premiumSingle: { value: 9_325, sourceId: "kff-ehbs-2025" },
  premiumFamily: { value: 26_993, sourceId: "kff-ehbs-2025" },
  workerShareSingle: { value: 0.16, sourceId: "kff-ehbs-2025" },
  workerShareFamily: { value: 0.26, sourceId: "kff-ehbs-2025" },
  deductibleSingle: { value: 1_886, sourceId: "kff-ehbs-2025" },
} satisfies Record<string, Sourced<number>>;

/** ACA cap on in-network cost sharing for one person, 2026 plan years. */
export const US_OOP_LIMIT_SELF_2026: Sourced<number> = {
  value: 10_600,
  sourceId: "cms-moop-2026",
};

/**
 * A plausible "typical" employer plan for people who don't know their own numbers.
 * The OOP max is the legal ceiling, so this example errs toward the high side of
 * real plans for the serious-illness scenario.
 */
export function exampleEmployerPlan(household: Household): EmployerPlan {
  const family = household.adults + household.children > 1;
  const premium = family ? US_EMPLOYER_AVERAGES.premiumFamily.value : US_EMPLOYER_AVERAGES.premiumSingle.value;
  const share = family ? US_EMPLOYER_AVERAGES.workerShareFamily.value : US_EMPLOYER_AVERAGES.workerShareSingle.value;
  const employeePremium = Math.round(premium * share);
  return {
    kind: "employer",
    employeePremium,
    employerPremium: premium - employeePremium,
    deductible: US_EMPLOYER_AVERAGES.deductibleSingle.value,
    coinsurance: 0.2,
    oopMax: US_OOP_LIMIT_SELF_2026.value,
  };
}
