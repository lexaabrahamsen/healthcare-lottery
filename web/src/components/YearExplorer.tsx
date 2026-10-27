import { useMemo, useState } from 'react'
import type { AllResults, EmployerPlan, Household, CountryId } from '@engine'
import { COUNTRIES } from '@engine'
import { Flag } from '@/components/Flag'
import { StoryChart } from '@/components/StoryChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { chartRows, totalFor } from '@/lib/chartData'
import { usd } from '@/lib/format'
import { buildSteps, type StepId } from '@/lib/story'
import { cn } from '@/lib/utils'

interface Props {
  all: AllResults
  plan: EmployerPlan
  household: Household
  showEmployer: boolean
  /** The comparison country, highlighted in the chart next to the US. */
  highlight: CountryId
}

const TAB_LABELS: Record<StepId, string> = {
  cover: 'Coverage',
  healthy: 'Healthy year',
  baby: 'A baby',
  serious: 'Serious illness',
}

const CAPTIONS: Record<StepId, string> = {
  cover: 'Coverage only',
  healthy: 'A healthy year',
  baby: 'A year with a baby',
  serious: 'A year with a serious illness',
}

/** The right-hand widgets: four cards for the four ways the year can go, and the chart for the one you pick. */
export function YearExplorer({ all, plan, household, showEmployer, highlight }: Props) {
  const steps = useMemo(() => buildSteps(all, plan, household, showEmployer), [all, plan, household, showEmployer])
  const rows = useMemo(() => chartRows(all, showEmployer), [all, showEmployer])
  const [stepId, setStepId] = useState<StepId>('cover')
  const index = Math.max(0, steps.findIndex((s) => s.id === stepId))
  const step = steps[index]!
  const next = steps[index + 1]

  // For each card: what the US pays, and the range everywhere else.
  const summary = (scenario: StepCopyScenario) => {
    const us = rows.find((r) => r.id === 'US')!
    const others = rows.filter((r) => r.id !== 'US').map((r) => totalFor(r, scenario))
    return { us: totalFor(us, scenario), lo: Math.min(...others), hi: Math.max(...others) }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">How the year can go</h2>
        <p className="text-sm text-muted-foreground">Everyone pays to be covered. Then the year deals a hand. Pick one.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {steps.map((s) => {
          const m = summary(s.scenario)
          const active = s.id === stepId
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStepId(s.id)}
              aria-pressed={active}
              className={cn(
                'rounded-xl bg-card p-4 text-left ring-1 ring-foreground/10 transition-all hover:ring-foreground/30',
                active && 'ring-2 ring-foreground',
              )}
            >
              <span className="block text-sm font-medium">{TAB_LABELS[s.id]}</span>
              <span className="mt-1 block font-display text-2xl font-bold tabular-nums">{usd(m.us)}</span>
              <span className="block text-xs text-muted-foreground">in the US</span>
              <span className="mt-2 block text-xs text-muted-foreground">
                {usd(m.lo)} to {usd(m.hi)} elsewhere
              </span>
            </button>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-xl font-bold">{step.title}</CardTitle>
          <CardDescription className="max-w-3xl text-sm leading-relaxed">{step.body}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <StoryChart all={all} showEmployer={showEmployer} scenario={step.scenario} caption={CAPTIONS[step.id]} highlight={highlight} />

          <ul className="grid gap-3 sm:grid-cols-2">
            {step.callouts.map((c) => (
              <li key={c.country + c.text} className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                <strong className="inline-flex items-center gap-1.5 font-display text-foreground">
                  <Flag country={c.country} className="h-3" />
                  {COUNTRIES[c.country].name}.
                </strong>{' '}
                {c.text}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-xs text-muted-foreground">
              The UK and Canada have no premiums, so their figures estimate the share of your taxes that pays for health care.
              The other countries' figures leave out the taxes that fund their public programs.
            </p>
            {next && (
              <Button variant="outline" onClick={() => setStepId(next.id)}>
                Next: {TAB_LABELS[next.id].toLowerCase()} →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type StepCopyScenario = ReturnType<typeof buildSteps>[number]['scenario']
