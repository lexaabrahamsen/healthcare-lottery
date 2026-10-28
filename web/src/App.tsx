import { useEffect, useMemo, useState } from 'react'
import { COUNTRIES, SCENARIOS, compareAll, exampleEmployerPlan } from '@engine'
import type { CountryId, Household, ScenarioId } from '@engine'
import { HouseholdBand } from '@/components/HouseholdBand'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Versus } from '@/components/Versus'
import { YearExplorer } from '@/components/YearExplorer'
import { describeHousehold } from '@/lib/household'
import { usd } from '@/lib/format'
import { DEFAULTS, parseState, serializeState } from '@/lib/urlState'

const ALLOWED = {
  countries: Object.keys(COUNTRIES).filter((id) => id !== 'US'),
  scenarios: Object.keys(SCENARIOS),
}

export default function App() {
  // The link carries the household and choices, so start from whatever the URL says.
  const [initial] = useState(() => parseState(window.location.search, ALLOWED))
  const [income, setIncome] = useState(initial.income)
  const [adults, setAdults] = useState<1 | 2>(initial.adults)
  const [children, setChildren] = useState(initial.children)
  const [scenario, setScenario] = useState(initial.scenario as ScenarioId)
  const [other, setOther] = useState(initial.vs as CountryId)
  const [view, setView] = useState<'you' | 'full'>(initial.view)

  // Keep the address bar in sync, so copying the URL always shares what's on screen.
  useEffect(() => {
    const query = serializeState({ income, adults, children, vs: other, scenario, view })
    window.history.replaceState(null, '', window.location.pathname + query)
  }, [income, adults, children, other, scenario, view])

  const household = useMemo<Household>(() => ({ adults, children }), [adults, children])
  const plan = useMemo(() => exampleEmployerPlan(household), [household])
  // All three scenarios at once: the year cards show each, the head-to-head shows one.
  const all = useMemo(
    () => compareAll({ state: 'PA', annualIncomeUSD: income, household, coverage: plan }),
    [income, household, plan],
  )

  const showEmployer = view === 'full'
  const householdLabel = `${describeHousehold(household)} earning ${usd(income)} a year`
  const inputsKey = `${income}-${adults}-${children}-${view}`
  const isExample = income === DEFAULTS.income && adults === DEFAULTS.adults && children === DEFAULTS.children

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Healthcare Lottery</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Every family pays for health care. The lottery is what happens next. See one household's year in the US and five
            other countries.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* One container: the household on top drives everything beneath it. */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <HouseholdBand
          income={income}
          adults={adults}
          children={children}
          view={view}
          isExample={isExample}
          onIncome={setIncome}
          onAdults={setAdults}
          onChildren={setChildren}
          onView={setView}
        />
        <div className="relative border-t">
          <span className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full border bg-background px-3 py-0.5 text-xs font-medium text-muted-foreground sm:left-5">
            <span aria-hidden>↓</span> Everything below updates as you change this
          </span>
        </div>
        <div className="pt-3">
          <YearExplorer
            all={all}
            plan={plan}
            household={household}
            showEmployer={showEmployer}
            highlight={other}
            householdLabel={householdLabel}
            inputsKey={inputsKey}
          />
        </div>
      </section>

      <Versus all={all} scenario={scenario} onScenario={setScenario} other={other} onOther={setOther} showEmployer={showEmployer} householdLabel={householdLabel} />

      <footer className="space-y-1 border-t pt-4 text-xs text-muted-foreground">
        <p>
          <strong className="font-display text-foreground">Sources and methods.</strong> Every number traces to a source,
          listed in each line item above and in the{' '}
          <a
            className="underline underline-offset-2 hover:text-foreground"
            href="https://github.com/lexaabrahamsen/healthcare-lottery/blob/main/METHODOLOGY.md"
          >
            methodology
          </a>
          .
        </p>
        <p>
          Exchange rates in this version are placeholders, and some 2026 figures come from secondary sources pending
          confirmation.
        </p>
      </footer>
    </main>
  )
}
