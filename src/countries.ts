import type { CostBreakdown, CountryId, Scenario, UserProfile } from "./types.ts";
import { computeUS } from "./models/us.ts";
import { computeDE } from "./models/de.ts";
import { computeUK } from "./models/uk.ts";
import { computeCH } from "./models/ch.ts";
import { computeCA } from "./models/ca.ts";
import { computeNL } from "./models/nl.ts";

/** How a country mostly pays for care. The UI colors a chip by this. */
export type FundingModel = "employer" | "payroll" | "tax" | "private";

export interface CountryModel {
  id: CountryId;
  name: string;
  /** How the system is funded, in a few words, for labels in the UI. */
  system: string;
  model: FundingModel;
  /** True when the cost is an estimate of tax paid toward health care, not a premium or fee. */
  estimatesFromTaxes?: boolean;
  compute: (profile: UserProfile, scenario: Scenario) => CostBreakdown;
}

/** To add a country: add its id to CountryId, write a model, and register it here. */
export const COUNTRIES: Record<CountryId, CountryModel> = {
  US: { id: "US", model: "employer", name: "United States", system: "Employer insurance", compute: computeUS },
  DE: { id: "DE", model: "payroll", name: "Germany", system: "Payroll-funded insurance", compute: computeDE },
  UK: { id: "UK", model: "tax", name: "United Kingdom", system: "Tax-funded (NHS)", estimatesFromTaxes: true, compute: computeUK },
  CH: { id: "CH", model: "private", name: "Switzerland", system: "Mandatory private insurance", compute: computeCH },
  CA: { id: "CA", model: "tax", name: "Canada", system: "Tax-funded (provincial)", estimatesFromTaxes: true, compute: computeCA },
  NL: { id: "NL", model: "private", name: "Netherlands", system: "Regulated private insurance", compute: computeNL },
};
