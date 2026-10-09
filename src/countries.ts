import type { CostBreakdown, CountryId, Scenario, UserProfile } from "./types.ts";
import { computeUS } from "./models/us.ts";
import { computeDE } from "./models/de.ts";
import { computeUK } from "./models/uk.ts";
import { computeCH } from "./models/ch.ts";
import { computeCA } from "./models/ca.ts";
import { computeNL } from "./models/nl.ts";

export interface CountryModel {
  id: CountryId;
  name: string;
  /** How the system is funded, in a few words, for labels in the UI. */
  system: string;
  compute: (profile: UserProfile, scenario: Scenario) => CostBreakdown;
}

/** To add a country: add its id to CountryId, write a model, and register it here. */
export const COUNTRIES: Record<CountryId, CountryModel> = {
  US: { id: "US", name: "United States", system: "Employer insurance", compute: computeUS },
  DE: { id: "DE", name: "Germany", system: "Payroll-funded insurance", compute: computeDE },
  UK: { id: "UK", name: "United Kingdom", system: "Tax-funded (NHS)", compute: computeUK },
  CH: { id: "CH", name: "Switzerland", system: "Mandatory private insurance", compute: computeCH },
  CA: { id: "CA", name: "Canada", system: "Tax-funded (provincial)", compute: computeCA },
  NL: { id: "NL", name: "Netherlands", system: "Regulated private insurance", compute: computeNL },
};
