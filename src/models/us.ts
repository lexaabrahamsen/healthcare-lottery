import type { CostBreakdown, LineItem, Scenario, UserProfile } from "../types.ts";
import { roundCents, sumBy } from "../money.ts";

export interface CostSharingResult {
  deductiblePaid: number;
  coinsurancePaid: number;
  /** Deductible + coinsurance, after the OOP max is applied. */
  total: number;
  hitOopMax: boolean;
}

/**
 * Standard deductible → coinsurance → out-of-pocket maximum.
 * Ignores flat copays and free preventive care; both are folded into the scenario's
 * allowed-claims figure.
 */
export function costSharing(
  allowedClaims: number,
  plan: { deductible: number; coinsurance: number; oopMax: number },
): CostSharingResult {
  if (allowedClaims < 0) throw new RangeError("allowedClaims must be >= 0");
  const deductiblePaid = Math.min(allowedClaims, plan.deductible);
  const afterDeductible = Math.max(0, allowedClaims - plan.deductible);
  const coinsuranceRaw = afterDeductible * plan.coinsurance;
  const raw = deductiblePaid + coinsuranceRaw;
  const total = Math.min(raw, plan.oopMax);
  return {
    deductiblePaid: Math.min(deductiblePaid, plan.oopMax),
    coinsurancePaid: total - Math.min(deductiblePaid, plan.oopMax),
    total,
    hitOopMax: raw >= plan.oopMax,
  };
}

export function computeUS(profile: UserProfile, scenario: Scenario): CostBreakdown {
  const plan = profile.coverage;
  const user = (value: number, unit = "USD") => ({ value, sourceId: "user-input", unit });
  const cs = costSharing(scenario.usAllowedClaims.value, plan);

  const items: LineItem[] = [
    {
      id: "us-premium-employee",
      label: "Your share of the premium",
      amountUSD: plan.employeePremium,
      paidBy: "you",
      derivation: {
        formula: "Annual premium deducted from your pay",
        inputs: { employeePremium: user(plan.employeePremium) },
      },
    },
    {
      id: "us-oop",
      label: "Deductible and coinsurance",
      amountUSD: cs.total,
      paidBy: "you",
      derivation: {
        formula: cs.hitOopMax
          ? "Capped at your out-of-pocket maximum"
          : "min(claims, deductible) + (claims − deductible) × coinsurance",
        inputs: {
          allowedClaims: { ...scenario.usAllowedClaims, unit: "USD" },
          deductible: user(plan.deductible),
          coinsurance: user(plan.coinsurance, "share"),
          oopMax: user(plan.oopMax),
        },
      },
    },
  ];

  const warnings: string[] = [];
  if (plan.employerPremium !== undefined) {
    items.push({
      id: "us-premium-employer",
      label: "Your employer's share of the premium",
      amountUSD: plan.employerPremium,
      paidBy: "employer",
      derivation: {
        formula: "Paid by your employer as part of your compensation",
        inputs: { employerPremium: user(plan.employerPremium) },
      },
    });
  } else {
    warnings.push("Employer premium share not entered, so the full-cost view understates US costs.");
  }

  return finalize("US", scenario, items, warnings, [
    "Out-of-network care, balance billing and non-covered services",
    "Costs that fall across two plan years (a deductible paid twice)",
    "Income taxes that fund Medicare, Medicaid and the ACA",
  ]);
}

export function finalize(
  countryId: CostBreakdown["countryId"],
  scenario: Scenario,
  items: LineItem[],
  warnings: string[],
  exclusions: string[],
): CostBreakdown {
  const rounded = items.map((i) => ({ ...i, amountUSD: roundCents(i.amountUSD) }));
  return {
    countryId,
    scenarioId: scenario.id,
    items: rounded,
    visibleTotalUSD: sumBy(rounded.filter((i) => i.paidBy === "you"), (i) => i.amountUSD),
    fullTotalUSD: sumBy(rounded, (i) => i.amountUSD),
    exclusions,
    warnings,
  };
}
