import { useMemo, useState } from 'react'
import type { AllResults, EmployerPlan, Household } from '@engine'
import { COUNTRIES } from '@engine'
import { StoryChart } from '@/components/StoryChart'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildSteps, type StepId } from '@/lib/story'

interface Props {
  all: AllResults
  plan: EmployerPlan
  household: Household
  showEmployer: boolean
}

const TAB_LABELS: Record<StepId, string> = {
  cover: 'Coverage',
  healthy: 'Healthy year',
  baby: 'Baby',
  serious: 'Serious illness',
}

const CAPTIONS: Record<StepId, string> = {
  cover: 'Coverage only',
  healthy: 'A healthy year',
  baby: 'A year with a baby',
  serious: 'A year with a serious illness',
}

/** One chart, four ways the year can go. Pick one and the bars change; the text says what you are looking at. */
export function YearExplorer({ all, plan, household, showEmployer }: Props) {
  const steps = useMemo(() => buildSteps(all, plan, household, showEmployer), [all, plan, household, showEmployer])
  const [stepId, setStepId] = useState<StepId>('cover')
  const index = Math.max(0, steps.findIndex((s) => s.id === stepId))
  const step = steps[index]!
  const next = steps[index + 1]

  return (
    <div className="space-y-5">
      <Tabs value={stepId} onValueChange={(v) => setStepId(v as StepId)}>
        <TabsList className="grid w-full grid-cols-2 group-data-horizontal/tabs:h-auto sm:flex sm:w-fit">
          {steps.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="h-9 px-4 text-sm">
              {TAB_LABELS[s.id]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="max-w-3xl space-y-2">
        <h3 className="text-2xl font-bold leading-tight">{step.title}</h3>
        <p className="text-base leading-relaxed">{step.body}</p>
      </div>

      <StoryChart all={all} showEmployer={showEmployer} scenario={step.scenario} caption={CAPTIONS[step.id]} />

      <ul className="grid gap-3 sm:grid-cols-2">
        {step.callouts.map((c) => (
          <li key={c.country + c.text} className="border-l-2 border-foreground/40 pl-3 text-sm text-muted-foreground">
            <strong className="font-display text-foreground">{COUNTRIES[c.country].name}.</strong> {c.text}
          </li>
        ))}
      </ul>

      {next && (
        <Button variant="outline" onClick={() => setStepId(next.id)}>
          Next: {TAB_LABELS[next.id].toLowerCase()} →
        </Button>
      )}

      <p className="max-w-3xl text-xs text-muted-foreground">
        The UK and Canada have no premiums, so their figures estimate the share of your taxes that pays for health care. The
        other countries' figures leave out the taxes that fund their public programs. Read high-income results with that in
        mind.
      </p>
    </div>
  )
}
