import type { AllResults, EmployerPlan, Household, Summary } from '@engine'
import { SCENARIOS } from '@engine'
import { Chip } from '@/components/Chip'
import { describeHousehold } from '@/lib/household'
import { usd } from '@/lib/format'

interface Props {
  summary: Summary
  all: AllResults
  plan: EmployerPlan
  household: Household
  income: number
  isExample: boolean
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const amount = (all: AllResults, scenario: 'healthy' | 'serious', itemId: string) =>
  all[scenario].US.items.find((i) => i.id === itemId)?.amountUSD ?? 0

/** The page's opening claim, and the arithmetic behind it. Every figure comes from the same results as the chart. */
export function Headline({ summary: s, all, plan, household, income, isExample }: Props) {
  const range =
    Math.round(s.otherSpreadMinUSD) === Math.round(s.otherSpreadMaxUSD)
      ? usd(s.otherSpreadMinUSD)
      : `${usd(s.otherSpreadMinUSD)} to ${usd(s.otherSpreadMaxUSD)}`

  const premium = amount(all, 'healthy', 'us-premium-employee')
  const healthyCare = amount(all, 'healthy', 'us-oop')
  const seriousCare = amount(all, 'serious', 'us-oop')
  const hitCap = Math.round(seriousCare) === Math.round(plan.oopMax)

  const rows = [
    { label: 'A healthy year', parts: `premium ${usd(premium)} + care ${usd(healthyCare)}`, total: premium + healthyCare },
    {
      label: 'A serious illness',
      parts: `premium ${usd(premium)} + ${hitCap ? 'out-of-pocket maximum' : 'care'} ${usd(seriousCare)}`,
      total: premium + seriousCare,
    },
  ]

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={isExample ? 'outline' : 'neutral'}>{isExample ? 'Example household' : 'Your household'}</Chip>
        <Chip tone="neutral">{capitalize(describeHousehold(household))}</Chip>
        <Chip tone="neutral">{usd(income)} a year</Chip>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
          A serious illness adds <span className="whitespace-nowrap font-semibold">{usd(s.usSpreadUSD)}</span> to the US bill.
        </h2>
        <p className="text-lg text-muted-foreground">In the other {s.otherCount} countries it adds {range}.</p>
        <p className="text-sm text-muted-foreground">
          Cheaper than the US for this household: {s.cheaperThanUS.healthy} of {s.otherCount} countries in a healthy year,
          and {s.cheaperThanUS.serious} of {s.otherCount} in a serious illness.
        </p>
      </div>

      <div className="rounded-xl bg-muted/50 p-4 ring-1 ring-foreground/10">
        <h3 className="font-serif text-base font-medium">How we get {usd(s.usSpreadUSD)}</h3>
        <dl className="mt-2 space-y-1.5 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-wrap items-baseline gap-x-4">
              <dt className="flex-1 font-medium sm:w-40 sm:flex-none">{r.label}</dt>
              <dd className="order-3 basis-full text-muted-foreground sm:order-none sm:basis-0 sm:flex-1">{r.parts}</dd>
              <dd className="text-right tabular-nums">{usd(r.total)}</dd>
            </div>
          ))}
          <div className="flex items-baseline gap-x-4 border-t pt-1.5 font-semibold">
            <dt className="flex-1">Difference</dt>
            <dd className="text-right tabular-nums">{usd(s.usSpreadUSD)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Your premium doesn't change when you get sick; what changes is how much care you pay for. We assume the average
          US employer plan ({usd(plan.deductible)} deductible, {Math.round(plan.coinsurance * 100)}% coinsurance,{' '}
          {usd(plan.oopMax)} out-of-pocket cap) and {usd(SCENARIOS.serious.usAllowedClaims.value)} of covered care in a
          serious illness, which is enough to reach the cap. The other countries' math is in{' '}
          <a href="#compare" className="underline underline-offset-2 hover:text-foreground">Compare in detail</a>.
        </p>
      </div>
    </section>
  )
}
