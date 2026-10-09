import type { CostBreakdown, LineItem, Scenario, UserProfile } from "../types.ts";
import { CH_KVG_2026 as K, CH_SCENARIOS } from "../data/ch-2026.ts";
import { USD_PER_CHF } from "../data/fx.ts";
import { costSharing, finalize } from "./us.ts";

export function computeCH(profile: UserProfile, scenario: Scenario): CostBreakdown {
  const fx = USD_PER_CHF.value;
  const toUSD = (chf: number) => chf * fx;
  const { adults, children } = profile.household;
  const s = CH_SCENARIOS[scenario.id];
  const adultPremium = K.adultPremiumMonthly.value * 12;
  const childPremium = K.childPremiumMonthly.value * 12;

  // Deductible, then 10% coinsurance up to a CHF 700 cap: the same shape as the US plan.
  const cs = costSharing(s.claimsCHF.value, {
    deductible: K.deductible.value,
    coinsurance: K.coinsuranceRate.value,
    oopMax: K.deductible.value + K.coinsuranceCap.value,
  });
  const hospital = s.hospitalDays.value * K.hospitalDailyContribution.value;
  const fxInput = { ...USD_PER_CHF, unit: "USD/CHF" };

  const items: LineItem[] = [
    {
      id: "ch-premium-adults",
      label: adults === 1 ? "Your health insurance premium" : "Your and your partner's premiums",
      amountUSD: toUSD(adults * adultPremium),
      paidBy: "you",
      derivation: {
        formula: "adults × average monthly adult premium × 12, converted to USD. Premiums do not depend on income, and employers do not pay them.",
        inputs: {
          adults: { value: adults, sourceId: "user-input", unit: "people" },
          adultPremiumMonthly: { ...K.adultPremiumMonthly, unit: "CHF" },
          usdPerChf: fxInput,
        },
      },
    },
  ];
  if (children > 0) {
    items.push({
      id: "ch-premium-children",
      label: "Your children's premiums",
      amountUSD: toUSD(children * childPremium),
      paidBy: "you",
      derivation: {
        formula: "children × average monthly child premium × 12, converted to USD. Every child needs their own policy.",
        inputs: {
          children: { value: children, sourceId: "user-input", unit: "people" },
          childPremiumMonthly: { ...K.childPremiumMonthly, unit: "CHF" },
          usdPerChf: fxInput,
        },
      },
    });
  }
  items.push(
    {
      id: "ch-cost-sharing",
      label: "Deductible and coinsurance",
      amountUSD: toUSD(cs.total),
      paidBy: "you",
      derivation: {
        formula: "min(claims, deductible) + coinsurance on the rest, capped at deductible + coinsurance cap, converted to USD",
        inputs: {
          claims: { ...s.claimsCHF, unit: "CHF" },
          deductible: { ...K.deductible, unit: "CHF" },
          coinsuranceRate: { ...K.coinsuranceRate, unit: "share" },
          coinsuranceCap: { ...K.coinsuranceCap, unit: "CHF" },
          usdPerChf: fxInput,
        },
      },
    },
    {
      id: "ch-hospital",
      label: "Hospital daily contribution",
      amountUSD: toUSD(hospital),
      paidBy: "you",
      derivation: {
        formula: "hospital days × daily contribution, converted to USD",
        inputs: {
          hospitalDays: { ...s.hospitalDays, unit: "days" },
          dailyContribution: { ...K.hospitalDailyContribution, unit: "CHF" },
          usdPerChf: fxInput,
        },
      },
    },
  );

  return finalize(
    "CH",
    scenario,
    items,
    [
      "Premiums are the national average. They vary by canton, insurer and deductible choice, often by 30% or more.",
    ],
    [
      "Income-based premium subsidies (Prämienverbilligung), which can cut premiums sharply for low and middle incomes",
      "Supplementary insurance, dental care and other services the mandatory plan does not cover",
      "Income taxes that fund hospitals and the subsidies",
    ],
  );
}
