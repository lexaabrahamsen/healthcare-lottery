# Healthcare Lottery: calculation engine

A pure TypeScript engine that compares a household's annual US health costs with what the same income would pay in Germany, the UK, Switzerland, Canada and the Netherlands. It covers three scenarios: a healthy year, having a baby, and a serious illness.

This package has no UI and no runtime dependencies. The React app in `web/` imports it.

## Commands

```sh
npm test           # Node's built-in test runner, via tsx
npm run typecheck  # tsc --noEmit
npm run example    # prints a US vs. other-countries table across incomes and households
```

## Usage

```ts
import { compare, exampleEmployerPlan } from "./src/index.ts";

const household = { adults: 2, children: 2 } as const;

const result = compare(
  {
    state: "PA",
    annualIncomeUSD: 90_000,
    household,
    coverage: exampleEmployerPlan(household),
  },
  "baby",
);

result.results.US.visibleTotalUSD; // what you pay
result.results.DE.fullTotalUSD;    // what you pay plus your employer's share
result.results.UK; // also CH, CA and NL
result.results.DE.items[0].derivation; // formula and sourced inputs, for the methodology panel
```

## Layout

| Path | Contents |
|---|---|
| `src/types.ts` | `Sourced`, `Derivation`, `LineItem`, `CostBreakdown` |
| `src/sources.ts` | Registry of every source and assumption |
| `src/data/` | 2026 parameters for each country, the scenarios, and the exchange rate |
| `src/models/` | One model per country: `us.ts`, `de.ts`, `uk.ts`, `ch.ts`, `ca.ts`, `nl.ts` |
| `src/countries.ts` | Registry of countries. To add one, add its id to `CountryId`, write a model, and register it here |
| `test/integrity.test.ts` | Checks that every input resolves to a registered source and that totals add up |

`METHODOLOGY.md` explains every calculation in plain language.

## Notes

- **Vitest.** The build environment blocked npm installs, so the tests use `node:test`. To switch to Vitest, change the two imports in each test file and delete `test/node-test.d.ts`.
- **Placeholder data.** Values marked `assume-*` in `src/sources.ts` are placeholders until milestone 2 (the data pipeline) replaces them. These are the exchange rate and the healthy-year and serious-illness claim amounts.

## Web UI

The `web/` folder holds a Vite + React app (Tailwind CSS v4, shadcn/ui on Radix) that imports the engine from `src/` through the `@engine` alias.

```sh
npm --prefix web install   # one-time
npm run dev                # http://localhost:5173 (from the project root)
npm run build              # typecheck + production build
```
