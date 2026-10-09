import type { Sourced } from "../types.ts";
import type { TaxBand } from "../money.ts";

/** Federal income tax, 2026. All CAD, on taxable income. */
export const CA_FEDERAL_2026 = {
  bands: [
    { upTo: 58_523, rate: 0.14 },
    { upTo: 117_045, rate: 0.205 },
    { upTo: 181_440, rate: 0.26 },
    { upTo: 258_482, rate: 0.29 },
    { upTo: Infinity, rate: 0.33 },
  ] satisfies TaxBand[],
  creditRate: { value: 0.14, sourceId: "ca-tax-2026" },
  /** Basic personal amount before the high-income supplement. */
  basicPersonalAmount: { value: 14_829, sourceId: "ca-bpa-2026" },
  /** Extra amount that phases out between the next two income levels. */
  bpaSupplement: { value: 1_623, sourceId: "ca-bpa-2026" },
  bpaPhaseOutStart: { value: 181_440, sourceId: "ca-bpa-2026" },
  bpaPhaseOutEnd: { value: 258_482, sourceId: "ca-bpa-2026" },
} as const;

/** Ontario income tax and Ontario Health Premium, 2026. CAD. */
export const CA_ONTARIO_2026 = {
  bands: [
    { upTo: 53_891, rate: 0.0505 },
    { upTo: 107_785, rate: 0.0915 },
    { upTo: 150_000, rate: 0.1116 },
    { upTo: 220_000, rate: 0.1216 },
    { upTo: Infinity, rate: 0.1316 },
  ] satisfies TaxBand[],
  creditRate: { value: 0.0505, sourceId: "ca-tax-2026" },
  basicPersonalAmount: { value: 12_989, sourceId: "ca-bpa-2026" },
  /** 20% surtax on basic Ontario tax above the first threshold, plus 36% above the second. */
  surtaxThreshold1: { value: 5_818, sourceId: "ca-bpa-2026" },
  surtaxThreshold2: { value: 7_446, sourceId: "ca-bpa-2026" },
  surtaxRate1: { value: 0.2, sourceId: "ca-bpa-2026" },
  surtaxRate2: { value: 0.36, sourceId: "ca-bpa-2026" },
} as const;

/** Ontario Health Premium by taxable income, 2026. */
export function ontarioHealthPremium(income: number): number {
  if (income <= 20_000) return 0;
  if (income <= 25_000) return (income - 20_000) * 0.06;
  if (income <= 36_000) return 300;
  if (income <= 38_500) return 300 + (income - 36_000) * 0.06;
  if (income <= 48_000) return 450;
  if (income <= 48_600) return 450 + (income - 48_000) * 0.25;
  if (income <= 72_000) return 600;
  if (income <= 72_600) return 600 + (income - 72_000) * 0.25;
  if (income <= 200_000) return 750;
  if (income <= 200_600) return 750 + (income - 200_000) * 0.25;
  return 900;
}

/** Share of provincial program spending that goes to health. */
export const CA_PROVINCIAL_HEALTH_SHARE: Sourced<number> = {
  value: 0.4,
  sourceId: "ca-pt-health-share",
  note: "About 40% of provincial and territorial program spending.",
};

/** The Canada Health Transfer ($57.4B in 2026–27) as a share of federal spending authority ($502.8B). */
export const CA_FEDERAL_HEALTH_SHARE: Sourced<number> = {
  value: 57.4 / 502.8,
  sourceId: "ca-cht-2026",
  note: "$57.4B Canada Health Transfer ÷ $502.8B total federal spending in 2026–27. Leaves out the federal government's direct health spending.",
};
