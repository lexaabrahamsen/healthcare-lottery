import { useMemo, useState } from 'react'
import { COUNTRIES, SCENARIOS, compare, exampleEmployerPlan } from '@engine'
import type { CountryId, Household, ScenarioId } from '@engine'
import { CountryCard } from '@/components/CountryCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Ranking } from '@/components/Ranking'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { usd } from '@/lib/format'

export default function App() {
  const [income, setIncome] = useState(75_000)
  const [adults, setAdults] = useState<1 | 2>(2)
  const [children, setChildren] = useState(2)
  const [scenario, setScenario] = useState<ScenarioId>('baby')
  const [other, setOther] = useState<CountryId>('DE')
  const [view, setView] = useState<'you' | 'full'>('you')

  const result = useMemo(() => {
    const household: Household = { adults, children }
    return compare(
      { state: 'PA', annualIncomeUSD: income, household, coverage: exampleEmployerPlan(household) },
      scenario,
    )
  }, [income, adults, children, scenario])

  const US = result.results.US
  const OTHER = result.results[other]
  const otherName = COUNTRIES[other].name
  const showEmployer = view === 'full'
  const diff = (showEmployer ? US.fullTotalUSD - OTHER.fullTotalUSD : US.visibleTotalUSD - OTHER.visibleTotalUSD)

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Healthcare Lottery</h1>
          <p className="text-muted-foreground">
            What a household pays for health care in the US, versus five other countries at the same income.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your household</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="income">Annual income (one earner)</Label>
              <Input
                id="income"
                type="number"
                min={0}
                step={1000}
                className="w-36 text-right tabular-nums"
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <Slider min={0} max={300_000} step={1000} value={[Math.min(income, 300_000)]} onValueChange={([v]) => setIncome(v ?? 0)} />
          </div>

          <div className="space-y-2">
            <Label>Adults</Label>
            <ToggleGroup type="single" variant="outline" value={String(adults)} onValueChange={(v) => v && setAdults(Number(v) as 1 | 2)}>
              <ToggleGroupItem value="1">1</ToggleGroupItem>
              <ToggleGroupItem value="2">2</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="children">Children</Label>
            <Input
              id="children"
              type="number"
              min={0}
              max={10}
              className="w-24"
              value={children}
              onChange={(e) => setChildren(Math.min(10, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={scenario} onValueChange={(v) => setScenario(v as ScenarioId)}>
          <TabsList>
            {Object.values(SCENARIOS).map((s) => (
              <TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ToggleGroup type="single" variant="outline" value={view} onValueChange={(v) => v && setView(v as 'you' | 'full')}>
          <ToggleGroupItem value="you">What you pay</ToggleGroupItem>
          <ToggleGroupItem value="full">Incl. employer share</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <p className="text-lg">
        {diff > 0 ? (
          <>The US costs this household <strong>{usd(diff)} more</strong> than {otherName}.</>
        ) : diff < 0 ? (
          <>{otherName} costs this household <strong>{usd(-diff)} more</strong> than the US.</>
        ) : (
          <>The two countries cost the same.</>
        )}
      </p>

      <Ranking results={result.results} showEmployer={showEmployer} selected={other} onSelect={setOther} />

      <div className="flex items-center gap-3">
        <Label htmlFor="other">Compare the US with</Label>
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

      <div className="grid gap-4 md:grid-cols-2">
        <CountryCard result={US} showEmployer={showEmployer} />
        <CountryCard result={OTHER} showEmployer={showEmployer} />
      </div>
    </main>
  )
}
