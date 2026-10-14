import type { AllResults, EmployerPlan } from '@engine'
import { SCENARIOS } from '@engine'
import { usd } from '@/lib/format'

const amount = (all: AllResults, scenario: 'healthy' | 'serious', itemId: string) =>
  all[scenario].US.items.find((i) => i.id === itemId)?.amountUSD ?? 0

/** The US arithmetic behind the gap, spelled out like a worksheet. */
export function Arithmetic({ all, plan }: { all: AllResults; plan: EmployerPlan }) {
  const premium = amount(all, 'healthy', 'us-premium-employee')
  const healthyCare = amount(all, 'healthy', 'us-oop')
  const seriousCare = amount(all, 'serious', 'us-oop')
  const hitCap = Math.round(seriousCare) === Math.round(plan.oopMax)
  const rows = [
    { label: 'Healthy year', parts: `premium ${usd(premium)} + care ${usd(healthyCare)}`, total: premium + healthyCare },
    {
      label: 'Serious illness',
      parts: `premium ${usd(premium)} + ${hitCap ? 'out-of-pocket maximum' : 'care'} ${usd(seriousCare)}`,
      total: premium + seriousCare,
    },
  ]

  return (
    <div className="bg-card p-4 ring-1 ring-foreground/50">
      <p className="font-display text-sm font-bold uppercase tracking-wider">Worksheet: the US gap</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-wrap items-baseline gap-x-4">
            <dt className="flex-1 font-medium sm:w-40 sm:flex-none">{r.label}</dt>
            <dd className="order-3 basis-full text-muted-foreground sm:order-none sm:basis-0 sm:flex-1">{r.parts}</dd>
            <dd className="text-right font-display font-bold tabular-nums">{usd(r.total)}</dd>
          </div>
        ))}
        <div className="flex items-baseline gap-x-4 border-t-2 border-foreground pt-1.5 font-bold">
          <dt className="flex-1">Difference</dt>
          <dd className="text-right font-display tabular-nums">{usd(rows[1]!.total - rows[0]!.total)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Your premium doesn't change when you get sick; what changes is how much care you pay for. We assume the average US
        employer plan ({usd(plan.deductible)} deductible, {Math.round(plan.coinsurance * 100)}% coinsurance, {usd(plan.oopMax)}{' '}
        out-of-pocket cap) and {usd(SCENARIOS.serious.usAllowedClaims.value)} of covered care in a serious illness, enough to
        reach the cap.
      </p>
    </div>
  )
}
