import type { Household, Summary } from '@engine'
import { describeHousehold, describeIncome } from '@/lib/household'
import { usd } from '@/lib/format'

interface Props {
  summary: Summary
  household: Household
  income: number
  isExample: boolean
}

/** The page's opening claim. Every figure comes from the same results as the chart, so it stays true for any input. */
export function Headline({ summary: s, household, income, isExample }: Props) {
  const range =
    Math.round(s.otherSpreadMinUSD) === Math.round(s.otherSpreadMaxUSD)
      ? usd(s.otherSpreadMinUSD)
      : `${usd(s.otherSpreadMinUSD)} to ${usd(s.otherSpreadMaxUSD)}`

  return (
    <section className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {isExample ? 'An example household: ' : 'Your household: '}
        {describeHousehold(household)} {describeIncome(income)}
      </p>
      <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
        A serious illness adds <span className="whitespace-nowrap">{usd(s.usSpreadUSD)}</span> to the US bill.
      </h2>
      <p className="text-xl text-muted-foreground">
        In the other {s.otherCount} countries it adds {range}.
      </p>
      <p className="text-sm text-muted-foreground">
        Cheaper than the US for this household: {s.cheaperThanUS.healthy} of {s.otherCount} countries in a healthy year,
        and {s.cheaperThanUS.serious} of {s.otherCount} in a serious illness.
      </p>
    </section>
  )
}
