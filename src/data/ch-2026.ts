import type { ScenarioId, Sourced } from "../types.ts";

/** Swiss mandatory health insurance (KVG/LAMal) parameters for 2026. All CHF. */
export const CH_KVG_2026 = {
  /** Average monthly premium for adults (26+), standard CHF 300 deductible, with accident cover. */
  adultPremiumMonthly: { value: 465.3, sourceId: "ch-bag-premiums-2026" },
  /** Average monthly premium for children (0–18). */
  childPremiumMonthly: { value: 122.5, sourceId: "ch-bag-premiums-2026" },
  /** The lowest, and default, annual deductible for adults. Children pay none. */
  deductible: { value: 300, sourceId: "ch-kvg" },
  coinsuranceRate: { value: 0.1, sourceId: "ch-kvg" },
  /** The most coinsurance an adult pays in a year, on top of the deductible. */
  coinsuranceCap: { value: 700, sourceId: "ch-kvg" },
  hospitalDailyContribution: { value: 15, sourceId: "ch-kvg" },
} satisfies Record<string, Sourced<number>>;

export interface ChScenario {
  /** Claims for the adult with the health event that are subject to cost sharing. */
  claimsCHF: Sourced<number>;
  /** Hospital days charged at the daily contribution. */
  hospitalDays: Sourced<number>;
}

export const CH_SCENARIOS: Record<ScenarioId, ChScenario> = {
  healthy: {
    claimsCHF: { value: 1_500, sourceId: "assume-healthy-year", note: "A few visits, labs and generic prescriptions." },
    hospitalDays: { value: 0, sourceId: "assume-healthy-year" },
  },
  baby: {
    claimsCHF: {
      value: 0,
      sourceId: "ch-kvg",
      note: "Maternity services carry no deductible or coinsurance, from the 13th week of pregnancy to 8 weeks after birth (Art. 64 para. 7 KVG). Earlier visits are assumed negligible.",
    },
    hospitalDays: { value: 0, sourceId: "ch-kvg", note: "The hospital contribution does not apply to maternity." },
  },
  serious: {
    claimsCHF: {
      value: 150_000,
      sourceId: "assume-serious-illness",
      note: "Far above the point where the deductible and the coinsurance cap are both reached.",
    },
    hospitalDays: { value: 28, sourceId: "assume-serious-illness", note: "28 hospital days, as in the German scenario." },
  },
};
