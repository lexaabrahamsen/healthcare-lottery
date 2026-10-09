import type { CostBreakdown, LineItem, Scenario, UserProfile } from "../types.ts";
import { NL_SCENARIOS, NL_ZVW_2026 as Z } from "../data/nl-2026.ts";
import { USD_PER_EUR } from "../data/fx.ts";
import { finalize } from "./us.ts";

export function computeNL(profile: UserProfile, scenario: Scenario): CostBreakdown {
  const fx = USD_PER_EUR.value;
  const toUSD = (eur: number) => eur * fx;
  const incomeEUR = profile.annualIncomeUSD / fx;
  const s = NL_SCENARIOS[scenario.id];
  const { adults } = profile.household;
  const fxInput = { ...USD_PER_EUR, unit: "USD/EUR" };

  const deductible = Math.min(s.claimsEUR.value, Z.deductible.value);
  const kraamzorg = s.kraamzorgHours.value * Z.kraamzorgPerHour.value;
  const employerLevy = Math.min(Math.max(incomeEUR, 0), Z.incomeCeiling.value) * Z.employerRate.value;

  const items: LineItem[] = [
    {
      id: "nl-premium",
      label: adults === 1 ? "Your health insurance premium" : "Your and your partner's premiums",
      amountUSD: toUSD(adults * Z.nominalPremium.value),
      paidBy: "you",
      derivation: {
        formula: "adults × average nominal premium, converted to USD. Children under 18 are covered at no charge.",
        inputs: {
          adults: { value: adults, sourceId: "user-input", unit: "people" },
          nominalPremium: { ...Z.nominalPremium, unit: "EUR" },
          usdPerEur: fxInput,
        },
      },
    },
    {
      id: "nl-deductible",
      label: "Mandatory deductible (eigen risico)",
      amountUSD: toUSD(deductible),
      paidBy: "you",
      derivation: {
        formula: "min(claims that count, deductible), converted to USD",
        inputs: {
          claims: { ...s.claimsEUR, unit: "EUR" },
          deductible: { ...Z.deductible, unit: "EUR" },
          usdPerEur: fxInput,
        },
      },
    },
    {
      id: "nl-kraamzorg",
      label: "Maternity home care contribution",
      amountUSD: toUSD(kraamzorg),
      paidBy: "you",
      derivation: {
        formula: "hours of home maternity care × statutory hourly contribution, converted to USD",
        inputs: {
          hours: { ...s.kraamzorgHours, unit: "hours" },
          perHour: { ...Z.kraamzorgPerHour, unit: "EUR" },
          usdPerEur: fxInput,
        },
      },
    },
    {
      id: "nl-employer-levy",
      label: "Your employer's health insurance levy",
      amountUSD: toUSD(employerLevy),
      paidBy: "employer",
      derivation: {
        formula: "min(income, ceiling) × employer rate, converted to USD",
        inputs: {
          incomeEUR: {
            value: incomeEUR,
            sourceId: "assume-fx",
            unit: "EUR",
            note: "Your US income converted to euros at the placeholder market rate.",
          },
          ceiling: { ...Z.incomeCeiling, unit: "EUR" },
          employerRate: { ...Z.employerRate, unit: "share" },
          usdPerEur: fxInput,
        },
      },
    },
  ];

  return finalize("NL", scenario, items, [], [
    "The healthcare allowance (zorgtoeslag), which pays up to about €1,574 a year to single people and €3,010 to couples on lower incomes",
    "Supplementary insurance, which most people buy for dental and physiotherapy",
    "Income taxes that fund long-term care and other health programs",
    "Premium variation between insurers (the average is used)",
  ]);
}
