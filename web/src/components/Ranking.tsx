import type { ComparisonResult, CountryId } from '@engine'
import { COUNTRIES } from '@engine'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { usd } from '@/lib/format'

interface Props {
  results: ComparisonResult['results']
  showEmployer: boolean
  selected: CountryId
  onSelect: (id: CountryId) => void
}

/** All countries side by side, cheapest first. Clicking a row picks the country to compare with the US in detail. */
export function Ranking({ results, showEmployer, selected, onSelect }: Props) {
  const rows = (Object.keys(COUNTRIES) as CountryId[])
    .map((id) => ({ id, total: showEmployer ? results[id].fullTotalUSD : results[id].visibleTotalUSD }))
    .sort((a, b) => a.total - b.total)
  const max = Math.max(...rows.map((r) => r.total), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>All countries</CardTitle>
        <CardDescription>Cheapest first. Pick a row to compare it with the US below.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {rows.map(({ id, total }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => id !== 'US' && onSelect(id)}
                disabled={id === 'US'}
                aria-pressed={id === selected}
                className={cn(
                  'grid w-full grid-cols-[7.5rem_1fr_5rem] items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm sm:grid-cols-[10rem_1fr_5rem]',
                  id !== 'US' && 'hover:bg-muted',
                  id === selected && 'bg-muted',
                )}
              >
                <span className="truncate">{COUNTRIES[id].name}</span>
                <span className="h-3 rounded-full bg-muted-foreground/10">
                  <span
                    className={cn('block h-full rounded-full', id === 'US' ? 'bg-foreground' : 'bg-primary/60')}
                    style={{ width: `${(total / max) * 100}%` }}
                  />
                </span>
                <span className="text-right tabular-nums">{usd(total)}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          The UK and Canada have no premiums, so their figures are an estimate of the share of your taxes that pays for health care.
          The other countries' figures leave out the taxes that fund their public programs. Read high-income results with that in mind.
        </p>
      </CardContent>
    </Card>
  )
}
