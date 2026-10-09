import type { ScenarioId, Sourced } from "../types.ts";

/** England, Wales and Northern Ireland rates for 2026/27. All GBP. Scotland has its own income tax bands. */
export const UK_TAX_2026 = {
  personalAllowance: { value: 12_570, sourceId: "uk-tax-2026" },
  /** The allowance shrinks by £1 for every £2 of income above this. */
  allowanceTaperStart: { value: 100_000, sourceId: "uk-tax-2026" },
  /** Width of the 20% band, measured on taxable income (income minus allowance). */
  basicBandWidth: { value: 37_700, sourceId: "uk-tax-2026" },
  /** Taxable income above this is charged at the additional rate. */
  higherBandLimit: { value: 125_140, sourceId: "uk-tax-2026" },
  basicRate: { value: 0.2, sourceId: "uk-tax-2026" },
  higherRate: { value: 0.4, sourceId: "uk-tax-2026" },
  additionalRate: { value: 0.45, sourceId: "uk-tax-2026" },
  /** Employee National Insurance (Class 1). */
  niPrimaryThreshold: { value: 12_570, sourceId: "uk-tax-2026" },
  niUpperEarningsLimit: { value: 50_270, sourceId: "uk-tax-2026" },
  niMainRate: { value: 0.08, sourceId: "uk-tax-2026" },
  niUpperRate: { value: 0.02, sourceId: "uk-tax-2026" },
} satisfies Record<string, Sourced<number>>;

export const UK_EMPLOYER_NI_2026 = {
  rate: { value: 0.15, sourceId: "uk-employer-ni-2026" },
  secondaryThreshold: { value: 5_000, sourceId: "uk-employer-ni-2026" },
} satisfies Record<string, Sourced<number>>;

/** Health's share of total UK government spending, 2024/25 plans. Used to attribute tax to the NHS. */
export const UK_HEALTH_SHARE: Sourced<number> = {
  value: 0.18,
  sourceId: "fullfact-nhs-share",
  note: "About 18% of total managed expenditure. We treat that share of your income tax and National Insurance as paying for health.",
};

/** English prescription charges, 2026/27. The NHS itself is free at the point of use. */
export const UK_PRESCRIPTIONS_2026 = {
  charge: { value: 9.9, sourceId: "uk-nhs-rx-2026" },
  /** 12-month prepayment certificate: the most anyone pays in a year. */
  annualCertificate: { value: 114.5, sourceId: "uk-nhs-rx-2026" },
} satisfies Record<string, Sourced<number>>;

/** Prescription items collected in the year, per scenario. */
export const UK_SCENARIO_PRESCRIPTIONS: Record<ScenarioId, Sourced<number>> = {
  healthy: { value: 2, sourceId: "assume-healthy-year", note: "Two prescription items." },
  baby: {
    value: 0,
    sourceId: "uk-nhs-rx-exemption",
    note: "Prescriptions are free during pregnancy and for 12 months after birth with a maternity exemption certificate.",
  },
  serious: {
    value: 15,
    sourceId: "assume-serious-illness",
    note: "More items than a year's prepayment certificate covers, so the certificate caps the cost.",
  },
};
