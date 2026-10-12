import { useEffect, useMemo, useState } from 'react'
import { COUNTRIES, SCENARIOS, compareAll, exampleEmployerPlan, summarize } from '@engine'
import type { CountryId, Household, ScenarioId } from '@engine'
import { CountryCard } from '@/components/CountryCard'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Headline } from '@/components/Headline'
import { HouseholdBar } from '@/components/HouseholdBar'
import { RangeChart } from '@/components/RangeChart'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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

  // All three scenarios at once: the chart shows the spread, the cards below show one.
  const all = useMemo(() => {
    const household: Household = { adults, children }
    return compareAll({ state: 'PA', annualIncomeUSD: income, household, coverage: exampleEmployerPlan(household) })
  }, [income, adults, children])

  const plan = useMemo(() => exampleEmployerPlan({ adults, children }), [adults, children])
  const US = all[scenario].US
  const OTHER = all[scenario][other]
  const otherName = COUNTRIES[other].name
  const showEmployer = view === 'full'
  const summary = useMemo(() => summarize(all, showEmployer), [all, showEmployer])
  const isExample = income === DEFAULTS.income && adults === DEFAULTS.adults && children === DEFAULTS.children
  const diff = (showEmployer ? US.fullTotalUSD - OTHER.fullTotalUSD : US.visibleTotalUSD - OTHER.visibleTotalUSD)

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Healthcare Lottery</h1>
          <p className="max-w-xl text-muted-foreground">
            What a household pays for health care in the US, versus five other countries at the same income.
          </p>
        </div>
        <ThemeToggle />
      </header>


      <Headline summary={summary} all={all} plan={plan} household={{ adults, children }} income={income} isExample={isExample} />

      <HouseholdBar
        income={income}
        adults={adults}
        children={children}
        onIncome={setIncome}
        onAdults={setAdults}
        onChildren={setChildren}
      />

      <div className="flex justify-end">
        <ToggleGroup type="single" variant="outline" value={view} onValueChange={(v) => v && setView(v as 'you' | 'full')}>
          <ToggleGroupItem value="you">What you pay</ToggleGroupItem>
          <ToggleGroupItem value="full">Incl. employer share</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <RangeChart results={all} showEmployer={showEmployer} selected={other} onSelect={setOther} />


      <section id="compare" className="scroll-mt-6 space-y-4">
        <h2 className="font-serif text-2xl font-semibold tracking-tight">Compare in detail</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="other">US vs.</Label>
            <Select value={other} onValueChange={(v) => setOther(v as CountryId)}>
              <SelectTrigger id="other" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(COUNTRIES)
                  .filter((c) => c.id !== 'US')
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs value={scenario} onValueChange={(v) => setScenario(v as ScenarioId)}>
            <TabsList>
              {Object.values(SCENARIOS).map((s) => (
                <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <p className="text-lg">
          {diff > 0 ? (
            <>In {SCENARIOS[scenario].label.toLowerCase()}, the US costs this household <strong>{usd(diff)} more</strong> than {otherName}.</>
          ) : diff < 0 ? (
            <>In {SCENARIOS[scenario].label.toLowerCase()}, {otherName} costs this household <strong>{usd(-diff)} more</strong> than the US.</>
          ) : (
            <>The two countries cost the same.</>
          )}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <CountryCard result={US} showEmployer={showEmployer} />
          <CountryCard result={OTHER} showEmployer={showEmployer} />
        </div>
      </section>
    </main>
  )
}
