import type { ComparisonResult, CountryId, ScenarioId, UserProfile } from "./types.ts";
import { COUNTRIES } from "./countries.ts";
import { SCENARIOS } from "./data/scenarios.ts";
import { compare } from "./index.ts";

export type AllResults = Record<ScenarioId, ComparisonResult["results"]>;

/** Every scenario for one household, so a view can show the spread and not just one outcome. */
export function compareAll(profile: UserProfile): AllResults {
  return Object.fromEntries(
    (Object.keys(SCENARIOS) as ScenarioId[]).map((id) => [id, compare(profile, id).results]),
  ) as AllResults;
}

export interface Summary {
  /** What a serious illness adds to the US bill, over a healthy year. */
  usSpreadUSD: number;
  /** The smallest and largest amount a serious illness adds in the other countries. */
  otherSpreadMinUSD: number;
  otherSpreadMaxUSD: number;
  /** How many other countries cost this household less than the US, per scenario. */
  cheaperThanUS: Record<ScenarioId, number>;
  otherCount: number;
}

/**
 * The numbers behind the page's headline. Everything is computed from the results, so the
 * headline stays true when the household changes; it never assumes the US is worse.
 */
export function summarize(all: AllResults, showEmployer: boolean): Summary {
  const total = (s: ScenarioId, id: CountryId) => (showEmployer ? all[s][id].fullTotalUSD : all[s][id].visibleTotalUSD);
  const spread = (id: CountryId) => total("serious", id) - total("healthy", id);
  const others = (Object.keys(COUNTRIES) as CountryId[]).filter((id) => id !== "US");
  const spreads = others.map(spread);
  const cheaper = (s: ScenarioId) => others.filter((id) => total(s, id) < total(s, "US")).length;
  return {
    usSpreadUSD: spread("US"),
    otherSpreadMinUSD: Math.min(...spreads),
    otherSpreadMaxUSD: Math.max(...spreads),
    cheaperThanUS: { healthy: cheaper("healthy"), baby: cheaper("baby"), serious: cheaper("serious") },
    otherCount: others.length,
  };
}
