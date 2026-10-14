import { useEffect, useMemo, useState } from 'react'
import { COUNTRIES, SCENARIOS, compareAll, exampleEmployerPlan } from '@engine'
import type { CountryId, Household, ScenarioId } from '@engine'
import { Chip } from '@/components/Chip'
import { CountryCard } from '@/components/CountryCard'
import { GovBanner } from '@/components/GovBanner'
import { HouseholdBar } from '@/components/HouseholdBar'
import { PartLabel } from '@/components/PartLabel'
import { ThemeToggle } from '@/components/ThemeToggle'
import { YearExplorer } from '@/components/YearExplorer'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { usd } from '@/lib/format'
import { describeHousehold } from '@/lib/household'
import { DEFAULTS, parseState, serializeState } from '@/lib/urlState'

const ALLOWED = {
  countries: Object.keys(COUNTRIES).filter((id) => id !== 'US'),
  scenarios: Object.keys(SCENARIOS),
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

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
  // All three scenarios at once: the story walks through them, the detail cards show one.
  const all = useMemo(
    () => compareAll({ state: 'PA', annualIncomeUSD: income, household, coverage: plan }),
    [income, household, plan],
  )

  const showEmployer = view === 'full'
  const isExample = income === DEFAULTS.income && adults === DEFAULTS.adults && children === DEFAULTS.children

  const US = all[scenario].US
  const OTHER = all[scenario][other]
  const otherName = COUNTRIES[other].name
  const diff = showEmployer ? US.fullTotalUSD - OTHER.fullTotalUSD : US.visibleTotalUSD - OTHER.visibleTotalUSD

  return (
    <>
      <GovBanner />
      <main className="mx-auto max-w-6xl space-y-14 px-4 py-8">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Statement of annual health care costs · 2026 data
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Healthcare Lottery</h1>
            <p className="max-w-2xl text-lg leading-relaxed">
              Every family pays for health care. The lottery is what happens next. Here is one household's year in the US and
              five other countries: what it pays to be covered, and what a healthy year, a baby or a serious illness adds.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <section className="space-y-4">
          <PartLabel part={1}>Household information</PartLabel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={isExample ? 'outline' : 'neutral'}>{isExample ? 'Example household' : 'Your household'}</Chip>
              <Chip>{capitalize(describeHousehold(household))}</Chip>
              <Chip>{usd(income)} a year</Chip>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <ToggleGroup type="single" variant="outline" value={view} onValueChange={(v) => v && setView(v as 'you' | 'full')}>
                <ToggleGroupItem value="you">What you pay</ToggleGroupItem>
                <ToggleGroupItem value="full">Incl. employer share</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <HouseholdBar
            income={income}
            adults={adults}
            children={children}
            onIncome={setIncome}
            onAdults={setAdults}
            onChildren={setChildren}
          />
        </section>

        <section className="space-y-6">
          <PartLabel part={2}>How the year can go</PartLabel>
          <YearExplorer all={all} plan={plan} household={household} showEmployer={showEmployer} />
        </section>

        <section id="compare" className="scroll-mt-6 space-y-4">
          <PartLabel part={3}>Compare in detail</PartLabel>
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

        <footer className="space-y-2 border-t-2 border-foreground pt-4 text-xs text-muted-foreground">
          <p>
            <strong className="font-display uppercase tracking-wider text-foreground">Sources and methods.</strong> Every number
            traces to a source, listed in each line item above and in the{' '}
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
            confirmation. An independent project, not affiliated with any government agency.
          </p>
        </footer>
      </main>
    </>
  )
}
