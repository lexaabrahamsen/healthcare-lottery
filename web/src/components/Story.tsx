import { useEffect, useMemo, useRef, useState } from 'react'
import type { AllResults, EmployerPlan, Household } from '@engine'
import { COUNTRIES } from '@engine'
import { StoryChart } from '@/components/StoryChart'
import { buildSteps } from '@/lib/story'
import { cn } from '@/lib/utils'

interface Props {
  all: AllResults
  plan: EmployerPlan
  household: Household
  showEmployer: boolean
}

const CAPTIONS = {
  cover: 'Line 1. Coverage only',
  healthy: 'Line 2. A healthy year',
  baby: 'Line 3. A year with a baby',
  serious: 'Line 4. A year with a serious illness',
} as const

/** One family's year, told in steps. On wide screens one chart stays in view and fills in as you scroll; on narrow ones each step carries its own chart. */
export function Story({ all, plan, household, showEmployer }: Props) {
  const steps = useMemo(() => buildSteps(all, plan, household, showEmployer), [all, plan, household, showEmployer])
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    // The step crossing the middle of the viewport is the active one.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [steps.length])

  const current = steps[active] ?? steps[0]!

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-12">
      <ol className="space-y-10 lg:space-y-0">
        {steps.map((step, i) => (
          <li
            key={step.id}
            data-step={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            className="lg:flex lg:min-h-[72vh] lg:items-center"
          >
            <article className={cn('space-y-3 motion-safe:transition-opacity', i !== active && 'lg:opacity-35')}>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Line {i + 1}</p>
              <h3 className="font-display text-2xl font-bold leading-tight">{step.title}</h3>
              <p className="text-base leading-relaxed">{step.body}</p>
              <ul className="space-y-2 border-l-2 border-foreground/40 pl-3 text-sm text-muted-foreground">
                {step.callouts.map((c) => (
                  <li key={c.country + c.text}>
                    <strong className="font-display text-foreground">{COUNTRIES[c.country].name}.</strong> {c.text}
                  </li>
                ))}
              </ul>
              <div className="pt-2 lg:hidden">
                <StoryChart all={all} showEmployer={showEmployer} scenario={step.scenario} caption={CAPTIONS[step.id]} />
              </div>
            </article>
          </li>
        ))}
      </ol>

      <div className="hidden lg:block">
        <div className="sticky top-8">
          <StoryChart all={all} showEmployer={showEmployer} scenario={current.scenario} caption={CAPTIONS[current.id]} />
        </div>
      </div>
    </div>
  )
}
