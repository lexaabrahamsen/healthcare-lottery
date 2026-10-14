import type { AllResults, CountryId, ScenarioId } from '@engine'
import { COUNTRIES, splitCosts } from '@engine'

export interface ChartRow {
  id: CountryId
  /** The price of being covered. The same in every scenario. */
  coverage: number
  /** What you pay when you use care, per scenario. */
  care: Record<ScenarioId, number>
}

export const totalFor = (row: ChartRow, scenario: ScenarioId | null) => row.coverage + (scenario ? row.care[scenario] : 0)

/** One row per country, cheapest worst case first. Stable across the story so bars never jump between steps. */
export function chartRows(all: AllResults, showEmployer: boolean): ChartRow[] {
  return (Object.keys(COUNTRIES) as CountryId[])
    .map((id) => {
      const s = (sc: ScenarioId) => splitCosts(all[sc][id], showEmployer)
      return {
        id,
        coverage: s('healthy').coverageUSD,
        care: { healthy: s('healthy').careUSD, baby: s('baby').careUSD, serious: s('serious').careUSD },
      }
    })
    .sort((a, b) => totalFor(a, 'serious') - totalFor(b, 'serious'))
}

const LABEL_ROOM = 0.74 // share of the plot the longest bar may use; the rest holds its end label

function niceMax(value: number) {
  const step = [1_000, 2_000, 2_500, 5_000, 10_000, 20_000, 25_000, 50_000].find((s) => value / s <= 5) ?? 100_000
  return { max: Math.ceil(value / step) * step, step }
}

/** One axis for every chart in the story, sized to the worst case so the scale never changes. */
export function chartAxis(rows: ChartRow[]) {
  const worst = Math.max(...rows.map((r) => totalFor(r, 'serious')), ...rows.map((r) => totalFor(r, 'baby')), 1)
  const { max, step } = niceMax(worst / LABEL_ROOM)
  return {
    max,
    pct: (v: number) => (v / max) * 100,
    ticks: Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step),
  }
}

export const tickLabel = (t: number) => (t === 0 ? '$0' : `$${t / 1000}k`)
