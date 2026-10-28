import { useMemo, useState, type CSSProperties } from 'react'
import { Baby, Heart, ShieldCheck, Stethoscope, type LucideIcon } from 'lucide-react'
import { Tabs as TabsPrimitive } from 'radix-ui'
import type { AllResults, CountryId, EmployerPlan, Household } from '@engine'
import { COUNTRIES } from '@engine'
import { FlashValue } from '@/components/FlashValue'
import { Flag } from '@/components/Flag'
import { StoryChart } from '@/components/StoryChart'
import { Button } from '@/components/ui/button'
import { chartRows, totalFor } from '@/lib/chartData'
import { usd } from '@/lib/format'
import { buildSteps, type StepId } from '@/lib/story'

interface Props {
  all: AllResults
  plan: EmployerPlan
  household: Household
  showEmployer: boolean
  /** The comparison country, highlighted in the chart next to the US. */
  highlight: CountryId
  /** What is being shown, in words: "A family of 4 earning $87,000 a year". Echoed in the header. */
  householdLabel: string
  /** Changes whenever an input changes, so figures can flash to show the change flowing through. */
  inputsKey: string
}

/** Full label on wide screens, a short one on narrow screens where four tabs share the width. */
const TAB_LABELS: Record<StepId, { full: string; short: string }> = {
  cover: { full: 'Coverage', short: 'Coverage' },
  healthy: { full: 'Healthy year', short: 'Healthy' },
  baby: { full: 'A baby', short: 'Baby' },
  serious: { full: 'Serious illness', short: 'Illness' },
}

/** What each tab stands for. */
const ICONS: Record<StepId, LucideIcon> = {
  cover: ShieldCheck,
  healthy: Heart,
  baby: Baby,
  serious: Stethoscope,
}

/**
 * Tabs echo the chart's two colors: the coverage tab is blue like the coverage bars, and the three tabs that add
 * care costs are orange like the care segment. The tab bar doubles as a key to the chart below it.
 */
const TONES: Record<StepId, string> = {
  cover: 'var(--series-1)',
  healthy: 'var(--series-2)',
  baby: 'var(--series-2)',
  serious: 'var(--series-2)',
}

const CAPTIONS: Record<StepId, string> = {
  cover: 'Coverage only',
  healthy: 'A healthy year',
  baby: 'A year with a baby',
  serious: 'A year with a serious illness',
}

/**
 * A tab bar attached to one panel. The line under the tabs belongs to the tab row; the selected tab covers its piece
 * of that line and shares the panel's background, so it reads as a folder tab. Tabs sit flush with the panel's left
 * edge. Built on Radix Tabs for arrow-key navigation and tab roles.
 */
export function YearExplorer({ all, plan, household, showEmployer, highlight, householdLabel, inputsKey }: Props) {
  const steps = useMemo(() => buildSteps(all, plan, household, showEmployer), [all, plan, household, showEmployer])
  const rows = useMemo(() => chartRows(all, showEmployer), [all, showEmployer])
  const [stepId, setStepId] = useState<StepId>('cover')
  const index = Math.max(0, steps.findIndex((s) => s.id === stepId))
  const step = steps[index]!
  const next = steps[index + 1]
  const StepIcon = ICONS[step.id]
  const us = rows.find((r) => r.id === 'US')!

  return (
    <div className="space-y-3 p-4 sm:px-5 sm:pb-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl font-bold tracking-tight">How the year can go</h2>
        <p className="text-sm text-muted-foreground">
          <FlashValue value={householdLabel} inputsKey={inputsKey}>
            For {householdLabel}
          </FlashValue>
        </p>
      </div>

      <TabsPrimitive.Root className="viz" value={stepId} onValueChange={(v) => setStepId(v as StepId)}>
        <TabsPrimitive.List aria-label="How the year can go" className="grid grid-cols-4 gap-1 border-b border-foreground/10 sm:flex sm:gap-1.5">
          {steps.map((s) => {
            const Icon = ICONS[s.id]
            return (
              <TabsPrimitive.Trigger
                key={s.id}
                value={s.id}
                style={{ '--tone': TONES[s.id] } as CSSProperties}
                className="group relative flex min-w-0 flex-col items-start gap-1.5 rounded-t-xl border border-b-0 border-foreground/10 bg-muted/70 px-2.5 py-2 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-[state=active]:z-10 data-[state=active]:-mb-px data-[state=active]:bg-card data-[state=active]:pb-[calc(0.5rem+1px)] data-[state=active]:text-foreground sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3 sm:data-[state=active]:pb-[calc(0.75rem+1px)]"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--tone)_16%,transparent)] text-[var(--tone)] transition-colors group-data-[state=active]:bg-[var(--tone)] group-data-[state=active]:text-white sm:size-9">
                  <Icon className="size-4 sm:size-5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs font-medium sm:text-sm">
                    <span className="sm:hidden">{TAB_LABELS[s.id].short}</span>
                    <span className="hidden sm:inline">{TAB_LABELS[s.id].full}</span>
                  </span>
                  <span className="font-display text-xs font-bold tabular-nums sm:text-sm">
                    <span className="hidden font-sans font-normal sm:inline">US </span>
                    <FlashValue value={totalFor(us, s.scenario)} inputsKey={inputsKey}>
                      {usd(totalFor(us, s.scenario))}
                    </FlashValue>
                  </span>
                </span>
              </TabsPrimitive.Trigger>
            )
          })}
        </TabsPrimitive.List>

        <TabsPrimitive.Content
          value={stepId}
          className="relative grid gap-5 rounded-b-xl border border-t-0 border-foreground/10 bg-card p-4 outline-none sm:p-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-6"
        >
          <div className="min-w-0 space-y-3">
            <div className="max-w-3xl space-y-1">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <StepIcon className="size-5 shrink-0" style={{ color: TONES[step.id] }} aria-hidden />
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
            <StoryChart
              all={all}
              showEmployer={showEmployer}
              scenario={step.scenario}
              caption={CAPTIONS[step.id]}
              highlight={highlight}
              inputsKey={inputsKey}
            />
          </div>

          <aside className="space-y-3">
            <ul className="space-y-2">
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
            <p className="text-xs text-muted-foreground">
              The UK and Canada have no premiums, so their figures estimate the share of your taxes that pays for health care.
              The other countries' figures leave out the taxes that fund their public programs.
            </p>
            {next && (
              <Button variant="outline" size="sm" onClick={() => setStepId(next.id)}>
                Next: {TAB_LABELS[next.id].full.toLowerCase()} →
              </Button>
            )}
          </aside>
        </TabsPrimitive.Content>
      </TabsPrimitive.Root>
    </div>
  )
}
