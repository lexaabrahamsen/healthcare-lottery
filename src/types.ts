/**
 * Core types for the Healthcare Lottery engine.
 *
 * Design rule: no number reaches the UI without a Derivation that says how it was
 * computed and where each input came from. The "how we calculated this" panel is
 * rendered from these objects, so it cannot drift out of sync with the math.
 */

export type SourceKind =
  | "primary" // government agency, statute, insurer of record
  | "research" // KFF, OECD, peer-reviewed
  | "assumption" // our modeling choice, stated openly
  | "user"; // entered by the person using the app

export interface Source {
  id: string;
  kind: SourceKind;
  label: string;
  url?: string;
  /** ISO date the figure was checked. */
  retrieved?: string;
  notes?: string;
}

/** A value plus where it came from. */
export interface Sourced<T = number> {
  value: T;
  sourceId: string;
  /** Plain-language note shown in the methodology panel. */
  note?: string;
}

export type Currency = "USD" | "EUR";

export interface Derivation {
  /** Human-readable formula, e.g. "min(income, ceiling) × rate". */
  formula: string;
  inputs: Record<string, Sourced<number> & { unit?: string }>;
}

export type Payer = "you" | "employer";

export interface LineItem {
  id: string;
  label: string;
  /** Always USD, so countries are directly comparable. */
  amountUSD: number;
  paidBy: Payer;
  derivation: Derivation;
}

export interface CostBreakdown {
  countryId: CountryId;
  scenarioId: ScenarioId;
  items: LineItem[];
  /** What the person pays directly (premium share, contributions, out-of-pocket). */
  visibleTotalUSD: number;
  /** Visible plus what an employer pays on the person's behalf. */
  fullTotalUSD: number;
  /** Things this model leaves out on purpose, shown alongside the result. */
  exclusions: string[];
  warnings: string[];
}

export type CountryId = "US" | "DE" | "UK" | "CH" | "CA" | "NL";
export type ScenarioId = "healthy" | "baby" | "serious";

export interface Household {
  /** 1 or 2 adults. The model assumes one earner. */
  adults: 1 | 2;
  children: number;
}

export interface EmployerPlan {
  kind: "employer";
  /** Annual premium share deducted from your pay. */
  employeePremium: number;
  /** Annual amount your employer pays toward the premium. Optional because most people don't know it. */
  employerPremium?: number;
  /** Deductible that applies to the person with the claims. */
  deductible: number;
  /** Your share after the deductible, 0–1. */
  coinsurance: number;
  /** Out-of-pocket maximum that applies to the person with the claims. */
  oopMax: number;
}

export interface UserProfile {
  /** Two-letter state code. Unused by the employer model today; marketplace mode will need it. */
  state: string;
  /** Annual gross wage income in USD, for one earner. */
  annualIncomeUSD: number;
  household: Household;
  coverage: EmployerPlan;
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  /**
   * Allowed (negotiated) US claims for the person with the health event, in USD.
   * Each other country keeps its own scenario inputs next to its parameters in src/data.
   */
  usAllowedClaims: Sourced<number>;
}

export interface ComparisonResult {
  profile: UserProfile;
  scenario: Scenario;
  results: Record<CountryId, CostBreakdown>;
}
