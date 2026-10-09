import type { ScenarioId, Sourced } from "../types.ts";

/** Dutch basic health insurance (Zorgverzekeringswet) parameters for 2026. All EUR. */
export const NL_ZVW_2026 = {
  /** Average nominal premium per adult per year. Every adult pays their own. Children under 18 pay none. */
  nominalPremium: { value: 1_908, sourceId: "nl-premium-2026" },
  /** Mandatory annual deductible (eigen risico), for adults only. */
  deductible: { value: 385, sourceId: "nl-premium-2026" },
  /** Income-related contribution, paid by the employer on top of wages. */
  employerRate: { value: 0.061, sourceId: "nl-zvw-2026" },
  /** Wages above this are not assessed. */
  incomeCeiling: { value: 79_409, sourceId: "nl-zvw-2026" },
  /** Statutory own contribution per hour of maternity home care (kraamzorg). */
  kraamzorgPerHour: { value: 5.7, sourceId: "nl-kraamzorg" },
} satisfies Record<string, Sourced<number>>;

export interface NlScenario {
  /** Claims for the adult that count toward the deductible. GP visits are exempt and not counted. */
  claimsEUR: Sourced<number>;
  kraamzorgHours: Sourced<number>;
}

export const NL_SCENARIOS: Record<ScenarioId, NlScenario> = {
  healthy: {
    claimsEUR: { value: 200, sourceId: "assume-healthy-year", note: "Prescriptions and a specialist referral. GP visits do not count toward the deductible." },
    kraamzorgHours: { value: 0, sourceId: "assume-healthy-year" },
  },
  baby: {
    claimsEUR: { value: 0, sourceId: "nl-kraamzorg", note: "Midwife care, scans and the birth do not count toward the deductible." },
    kraamzorgHours: {
      value: 50,
      sourceId: "assume-baby-kraamzorg",
      note: "Home maternity care is covered for 24 to 80 hours. We assume 50.",
    },
  },
  serious: {
    claimsEUR: {
      value: 150_000,
      sourceId: "assume-serious-illness",
      note: "Far above the deductible, so the full €385 is paid.",
    },
    kraamzorgHours: { value: 0, sourceId: "assume-serious-illness" },
  },
};
