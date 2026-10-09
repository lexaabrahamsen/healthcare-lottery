// Prints what you pay in each country across incomes, households and scenarios, using the example employer plan.
import { COUNTRIES, SCENARIOS, compare, exampleEmployerPlan } from "../src/index.ts";
import type { CountryId, Household, ScenarioId } from "../src/index.ts";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const households: [string, Household][] = [
  ["single", { adults: 1, children: 0 }],
  ["family of 4", { adults: 2, children: 2 }],
];
const ids = Object.keys(COUNTRIES) as CountryId[];

for (const [name, household] of households) {
  console.log(`\n${name.toUpperCase()}: what you pay (with employer share in brackets)`);
  console.log(`${"income".padEnd(9)} | ${"scenario".padEnd(16)} | ${ids.map((id) => id.padEnd(19)).join(" | ")}`);
  for (const income of [35_000, 60_000, 100_000, 200_000]) {
    for (const id of Object.keys(SCENARIOS) as ScenarioId[]) {
      const r = compare(
        { state: "PA", annualIncomeUSD: income, household, coverage: exampleEmployerPlan(household) },
        id,
      ).results;
      const cell = (x: (typeof r)[CountryId]) => `${usd(x.visibleTotalUSD).padStart(8)} [${usd(x.fullTotalUSD).padStart(8)}]`;
      console.log(`${usd(income).padEnd(9)} | ${SCENARIOS[id].label.padEnd(16)} | ${ids.map((c) => cell(r[c])).join(" | ")}`);
    }
  }
}
