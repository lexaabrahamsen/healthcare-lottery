import type { AllResults, CountryId, CostBreakdown, ScenarioId } from '@engine'
import { COUNTRIES, SCENARIOS } from '@engine'
import { Flag } from '@/components/Flag'
import { CountryCard } from '@/components/CountryCard'
import { usd } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  all: AllResults
  scenario: ScenarioId
  onScenario: (s: ScenarioId) => void
  other: CountryId
  onOther: (c: CountryId) => void
  showEmployer: boolean
}

const OTHERS = (Object.keys(COUNTRIES) as CountryId[]).filter((id) => id !== 'US')

const pill = (active: boolean) =>
  cn(
    'flex items-center gap-2 rounded-full py-2 pr-4 pl-3 text-sm font-medium transition-colors',
    active ? 'bg-white text-neutral-900' : 'bg-white/10 text-neutral-200 hover:bg-white/20',
  )

/** The head-to-head: a bold banner with the picker, then the two bills side by side. */
export function Versus({ all, scenario, onScenario, other, onOther, showEmployer }: Props) {
  const total = (r: CostBreakdown) => (showEmployer ? r.fullTotalUSD : r.visibleTotalUSD)
  const US = all[scenario].US
  const OTHER = all[scenario][other]
  const name = COUNTRIES[other].name
  const diff = total(US) - total(OTHER)
  const max = Math.max(total(US), total(OTHER), 1)
  const label = SCENARIOS[scenario].label.toLowerCase()

  return (
    <section id="compare" className="scroll-mt-6 space-y-5">
      <div className="space-y-6 overflow-hidden rounded-3xl bg-neutral-900 p-6 text-neutral-50 ring-1 ring-foreground/10 sm:p-10 dark:bg-neutral-800">
        <div className="space-y-2">
          <p className="font-display text-sm font-bold text-neutral-400">Compare in detail</p>
          <h2 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="flex items-center gap-3 sm:gap-4">
              <Flag country="US" className="h-7 ring-white/25 sm:h-12" />
              U.S.
            </span>
            <span className="font-light italic text-neutral-400">vs.</span>
            <span className="flex items-center gap-3 sm:gap-4">
              <Flag country={other} className="h-7 ring-white/25 sm:h-12" />
              {name}
            </span>
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Country to compare with the US">
            {OTHERS.map((id) => (
              <button key={id} type="button" aria-pressed={id === other} onClick={() => onOther(id)} className={pill(id === other)}>
                <Flag country={id} className="h-3.5 ring-white/25" />
                {COUNTRIES[id].name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Scenario">
            <span className="mr-1 font-display text-sm font-bold text-neutral-400">In</span>
            {Object.values(SCENARIOS).map((s) => (
              <button key={s.id} type="button" aria-pressed={s.id === scenario} onClick={() => onScenario(s.id)} className={pill(s.id === scenario)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <p className="max-w-3xl text-xl leading-snug sm:text-2xl">
          {diff > 0 ? (
            <>In {label}, the US costs this household <strong className="font-display text-orange-300">{usd(diff)} more</strong> than {name}.</>
          ) : diff < 0 ? (
            <>In {label}, {name} costs this household <strong className="font-display text-orange-300">{usd(-diff)} more</strong> than the US.</>
          ) : (
            <>In {label}, the two cost this household the same.</>
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CountryCard result={US} showEmployer={showEmployer} share={total(US) / max} />
        <CountryCard result={OTHER} showEmployer={showEmployer} share={total(OTHER) / max} versus />
      </div>
    </section>
  )
}
