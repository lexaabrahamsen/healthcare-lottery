import type { Scenario, ScenarioId } from "../types.ts";

/**
 * The three scenarios. The US claims live here; every other country keeps its own
 * per-scenario inputs (copays, prescriptions, hospital days) in its data file.
 */
export const SCENARIOS: Record<ScenarioId, Scenario> = {
  healthy: {
    id: "healthy",
    label: "A healthy year",
    usAllowedClaims: { value: 1_500, sourceId: "assume-healthy-year" },
  },
  baby: {
    id: "baby",
    label: "Having a baby",
    usAllowedClaims: {
      value: 20_416,
      sourceId: "kff-pregnancy-2025",
      note: "Average for pregnancy, childbirth and postpartum care in employer plans. Excludes the newborn's own care.",
    },
  },
  serious: {
    id: "serious",
    label: "A serious illness",
    usAllowedClaims: { value: 150_000, sourceId: "assume-serious-illness" },
  },
};
