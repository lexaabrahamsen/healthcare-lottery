import type { CostBreakdown, LineItem, Scenario, UserProfile } from "../types.ts";
import { DE_COPAY_CAP_2026, DE_GKV_2026, DE_SCENARIO_COPAYS } from "../data/de-2026.ts";
import { USD_PER_EUR } from "../data/fx.ts";
import { finalize } from "./us.ts";

export interface GermanContribution {
  assessedIncomeEUR: number;
  /** Each side pays half of (general rate + additional rate). */
  employeeEUR: number;
  employerEUR: number;
  cappedAtCeiling: boolean;
}

export function gkvContribution(incomeEUR: number): GermanContribution {
  const ceiling = DE_GKV_2026.contributionCeiling.value;
  const assessed = Math.min(Math.max(incomeEUR, 0), ceiling);
  const halfRate = (DE_GKV_2026.generalRate.value + DE_GKV_2026.avgAdditionalRate.value) / 2;
  const each = assessed * halfRate;
  return { assessedIncomeEUR: assessed, employeeEUR: each, employerEUR: each, cappedAtCeiling: incomeEUR > ceiling };
}

/** Annual copay cap after household allowances, § 62 SGB V. */
export function copayCapEUR(incomeEUR: number, household: UserProfile["household"]): number {
  const allowances =
    (household.adults === 2 ? DE_COPAY_CAP_2026.spouseAllowance.value : 0) +
    household.children * DE_COPAY_CAP_2026.childAllowance.value;
  return Math.max(0, incomeEUR - allowances) * DE_COPAY_CAP_2026.rate.value;
}

export function computeDE(profile: UserProfile, scenario: Scenario): CostBreakdown {
  const fx = USD_PER_EUR.value;
  const toUSD = (eur: number) => eur * fx;
  const incomeEUR = profile.annualIncomeUSD / fx;
  const c = gkvContribution(incomeEUR);
  const cap = copayCapEUR(incomeEUR, profile.household);
  const copaysBeforeCap = DE_SCENARIO_COPAYS[scenario.id];
  const copays = Math.min(copaysBeforeCap.value, cap);

  const contributionInputs = {
    incomeEUR: {
      value: incomeEUR,
      sourceId: "assume-fx",
      unit: "EUR",
      note: "Your US income converted to euros at the placeholder market rate.",
    },
    ceiling: { ...DE_GKV_2026.contributionCeiling, unit: "EUR" },
    generalRate: { ...DE_GKV_2026.generalRate, unit: "share" },
    additionalRate: { ...DE_GKV_2026.avgAdditionalRate, unit: "share" },
    usdPerEur: { ...USD_PER_EUR, unit: "USD/EUR" },
  };
  const dependents = profile.household.adults - 1 + profile.household.children;
  const familyNote =
    dependents > 0
      ? ` Covers your ${dependents} dependent${dependents === 1 ? "" : "s"} at no extra cost (family insurance).`
      : "";

  const items: LineItem[] = [
    {
      id: "de-contribution-employee",
      kind: "coverage",
      label: "Your health insurance contribution",
      amountUSD: toUSD(c.employeeEUR),
      paidBy: "you",
      derivation: {
        formula: `min(income, ceiling) × (general rate + additional rate) ÷ 2, converted to USD.${familyNote}`,
        inputs: contributionInputs,
      },
    },
    {
      id: "de-copays",
      kind: "care",
      label: "Copays",
      amountUSD: toUSD(copays),
      paidBy: "you",
      derivation: {
        formula:
          copays < copaysBeforeCap.value
            ? "Capped at 2% of household income after allowances"
            : "Statutory copays for this scenario (below the annual cap)",
        inputs: {
          copaysBeforeCap: { ...copaysBeforeCap, unit: "EUR" },
          capRate: { ...DE_COPAY_CAP_2026.rate, unit: "share" },
          spouseAllowance: { ...DE_COPAY_CAP_2026.spouseAllowance, unit: "EUR" },
          childAllowance: { ...DE_COPAY_CAP_2026.childAllowance, unit: "EUR" },
          annualCap: { value: cap, sourceId: "sgb5-62", unit: "EUR" },
          usdPerEur: { ...USD_PER_EUR, unit: "USD/EUR" },
        },
      },
    },
    {
      id: "de-contribution-employer",
      kind: "coverage",
      label: "Your employer's contribution",
      amountUSD: toUSD(c.employerEUR),
      paidBy: "employer",
      derivation: {
        formula: "Employer pays the same amount as you",
        inputs: contributionInputs,
      },
    },
  ];

  const warnings: string[] = [];
  if (incomeEUR > DE_GKV_2026.mandatoryThreshold.value) {
    warnings.push(
      "At this income you could leave statutory insurance for private insurance. The model assumes you stay in the statutory system.",
    );
  }

  return finalize("DE", scenario, items, warnings, [
    "Long-term care insurance (Pflegeversicherung), a separate contribution of about 3.6% plus surcharges",
    "The federal tax subsidy to the health fund (Bundeszuschuss)",
    "Insurer-specific additional rates, which average above 2.9% in practice",
  ]);
}
