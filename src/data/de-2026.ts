import type { ScenarioId, Sourced } from "../types.ts";

/** German statutory health insurance (GKV) parameters for 2026. All EUR. */
export const DE_GKV_2026 = {
  /** General contribution rate, split equally between employee and employer. */
  generalRate: { value: 0.146, sourceId: "vdek-2026" },
  /**
   * Average additional contribution set by the health ministry. Each insurer sets its
   * own; the vdek notes the rate actually charged averages above 3%.
   */
  avgAdditionalRate: { value: 0.029, sourceId: "vdek-2026" },
  /** Income above this is not assessed (Beitragsbemessungsgrenze). */
  contributionCeiling: { value: 69_750, sourceId: "vdek-2026" },
  /** Above this, an employee may leave GKV for private insurance (Versicherungspflichtgrenze). */
  mandatoryThreshold: { value: 77_400, sourceId: "vdek-2026" },
} satisfies Record<string, Sourced<number>>;

/** Annual copay cap (Belastungsgrenze), § 62 SGB V. */
export const DE_COPAY_CAP_2026 = {
  rate: { value: 0.02, sourceId: "sgb5-62" },
  spouseAllowance: { value: 7_119, sourceId: "dak-freibetraege-2026" },
  childAllowance: { value: 9_756, sourceId: "dak-freibetraege-2026" },
} satisfies Record<string, Sourced<number>>;

/** German statutory copays (Zuzahlungen) per scenario, before the annual cap. EUR. */
export const DE_SCENARIO_COPAYS: Record<ScenarioId, Sourced<number>> = {
  healthy: {
    value: 10,
    sourceId: "assume-healthy-year",
    note: "Two prescriptions at the €5 minimum copay (§ 61 SGB V).",
  },
  baby: {
    value: 0,
    sourceId: "sgb5-24c",
    note: "Maternity care, including the hospital stay for delivery, carries no copays.",
  },
  serious: {
    value: 28 * 10 + 200,
    sourceId: "assume-serious-illness",
    note: "28 hospital days × €10 (the § 61 maximum) + €200 other copays.",
  },
};
