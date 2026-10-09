import type { Sourced } from "../types.ts";

/** USD per 1 EUR. Placeholder until the data pipeline pulls the ECB reference rate. */
export const USD_PER_EUR: Sourced<number> = { value: 1.16, sourceId: "assume-fx" };
/** USD per 1 GBP. Placeholder. */
export const USD_PER_GBP: Sourced<number> = { value: 1.34, sourceId: "assume-fx-gbp" };
/** USD per 1 CHF. Placeholder. */
export const USD_PER_CHF: Sourced<number> = { value: 1.25, sourceId: "assume-fx-chf" };
/** USD per 1 CAD. Placeholder. */
export const USD_PER_CAD: Sourced<number> = { value: 0.72, sourceId: "assume-fx-cad" };
