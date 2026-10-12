/**
 * What goes in a shared link. Parsing is strict: anything missing, malformed or out of range
 * falls back to the default, so a hand-edited or stale link can never break the page.
 * This file has no imports so the engine's test runner can cover it.
 */
export interface ShareState {
  income: number
  adults: 1 | 2
  children: number
  /** The country compared with the US in the detail section. */
  vs: string
  scenario: string
  view: 'you' | 'full'
}

export interface Allowed {
  /** Countries that can be picked as the comparison (everything except the US). */
  countries: readonly string[]
  scenarios: readonly string[]
}

export const DEFAULTS: ShareState = { income: 87_000, adults: 2, children: 2, vs: 'DE', scenario: 'baby', view: 'you' }

export const MAX_INCOME = 10_000_000
export const MAX_CHILDREN = 10

/** A whole number within [min, max], or undefined. */
function wholeNumber(raw: string | null, min: number, max: number): number | undefined {
  if (raw === null || !/^\d+$/.test(raw)) return undefined
  const n = Number(raw)
  return n >= min && n <= max ? n : undefined
}

export function parseState(search: string, allowed: Allowed): ShareState {
  const q = new URLSearchParams(search)
  const adults = wholeNumber(q.get('adults'), 1, 2)
  const vs = q.get('vs')
  const scenario = q.get('s')
  const view = q.get('view')
  return {
    income: wholeNumber(q.get('income'), 0, MAX_INCOME) ?? DEFAULTS.income,
    adults: adults === 1 || adults === 2 ? adults : DEFAULTS.adults,
    children: wholeNumber(q.get('kids'), 0, MAX_CHILDREN) ?? DEFAULTS.children,
    vs: vs !== null && allowed.countries.includes(vs) ? vs : DEFAULTS.vs,
    scenario: scenario !== null && allowed.scenarios.includes(scenario) ? scenario : DEFAULTS.scenario,
    view: view === 'full' ? 'full' : DEFAULTS.view,
  }
}

/** The query string for a state ("" when everything is a default), so the plain URL stays clean. */
export function serializeState(state: ShareState): string {
  const q = new URLSearchParams()
  if (state.income !== DEFAULTS.income) q.set('income', String(state.income))
  if (state.adults !== DEFAULTS.adults) q.set('adults', String(state.adults))
  if (state.children !== DEFAULTS.children) q.set('kids', String(state.children))
  if (state.vs !== DEFAULTS.vs) q.set('vs', state.vs)
  if (state.scenario !== DEFAULTS.scenario) q.set('s', state.scenario)
  if (state.view !== DEFAULTS.view) q.set('view', state.view)
  const s = q.toString()
  return s ? `?${s}` : ''
}
