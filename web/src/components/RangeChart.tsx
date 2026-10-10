import type { ComparisonResult, CountryId, ScenarioId } from '@engine'
import { COUNTRIES } from '@engine'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { usd } from '@/lib/format'

type Results = Record<ScenarioId, ComparisonResult['results']>

interface Props {
  results: Results
  showEmployer: boolean
  selected: CountryId
  onSelect: (id: CountryId) => void
}

interface Row {
  id: CountryId
  healthy: number
  baby: number
  serious: number
}

const GAP = 2 // px of surface color between touching segments
const LABEL_ROOM = 0.74 // share of the plot width the longest bar may use; the rest holds its label

/** Round up to a tick step that gives 3–5 clean gridlines. */
function niceMax(value: number) {
  const step = [1_000, 2_000, 2_500, 5_000, 10_000, 20_000, 25_000, 50_000].find((s) => value / s <= 5) ?? 100_000
  return { max: Math.ceil(value / step) * step, step }
}

export function RangeChart({ results, showEmployer, selected, onSelect }: Props) {
  const total = (s: ScenarioId, id: CountryId) => (showEmployer ? results[s][id].fullTotalUSD : results[s][id].visibleTotalUSD)
  // Cheapest worst case first: the order answers "how bad can it get?"
  const rows: Row[] = (Object.keys(COUNTRIES) as CountryId[])
    .map((id) => ({ id, healthy: total('healthy', id), baby: total('baby', id), serious: total('serious', id) }))
    .sort((a, b) => a.serious - b.serious)
  const { max, step } = niceMax(Math.max(...rows.map((r) => r.serious), 1) / LABEL_ROOM)
  const pct = (v: number) => (v / max) * 100
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)

  return (
    <Card className="viz">
      <CardHeader>
        <CardTitle>What the year costs, depending on what happens to you</CardTitle>
        <CardDescription>
          The orange part is what a serious illness adds. The longer it is, the more your bill depends on luck.
        </CardDescription>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-1 text-xs text-muted-foreground" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: 'var(--series-1)' }} />A healthy year
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: 'var(--series-2)' }} />Added by a serious illness
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-foreground ring-2 ring-card" />Having a baby
          </li>
        </ul>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-[7.5rem_1fr] gap-x-3 sm:grid-cols-[11rem_1fr]">
          {/* Plot column: gridlines sit behind the rows. */}
          <div />
          <div className="relative h-0">
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute top-0 w-px"
                style={{ left: `${pct(t)}%`, height: `${rows.length * 3.25}rem`, background: t === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)' }}
              />
            ))}
          </div>

          {rows.map((row) => {
            const country = COUNTRIES[row.id]
            const added = row.serious - row.healthy
            const w1 = pct(row.healthy)
            const w2 = added > 0 ? Math.max(pct(added), 0.6) : 0
            const clickable = row.id !== 'US'
            return (
              <button
                key={row.id}
                type="button"
                disabled={!clickable}
                onClick={() => onSelect(row.id)}
                aria-pressed={row.id === selected}
                aria-label={`${country.name}: healthy year ${usd(row.healthy)}, having a baby ${usd(row.baby)}, serious illness ${usd(row.serious)}`}
                className={cn(
                  'group relative col-span-2 grid h-[3.25rem] grid-cols-subgrid items-center rounded-md text-left outline-none',
                  clickable && 'hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring',
                  row.id === selected && 'bg-muted/60',
                )}
              >
                <span className="min-w-0 pl-2">
                  <span className={cn('block truncate text-sm', row.id === 'US' && 'font-semibold')}>{country.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {country.estimatesFromTaxes ? 'Estimated from taxes' : country.system}
                  </span>
                </span>

                <span className="relative block h-6">
                  <span
                    className="absolute inset-y-0 left-0 rounded-r-[4px] group-hover:brightness-110"
                    style={{ width: `${w1}%`, background: 'var(--series-1)', borderRadius: added > 0 ? 0 : '0 4px 4px 0' }}
                  />
                  {added > 0 && (
                    <span
                      className="absolute inset-y-0 rounded-r-[4px] group-hover:brightness-110"
                      style={{ left: `calc(${w1}% + ${GAP}px)`, width: `calc(${w2}% - ${GAP}px)`, minWidth: 3, background: 'var(--series-2)' }}
                    />
                  )}
                  {/* Baby marker, with a surface ring so it stays legible over either segment. */}
                  <span
                    className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-card"
                    style={{ left: `${pct(row.baby)}%` }}
                  />
                  <span
                    className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-2 text-sm tabular-nums"
                    style={{ left: `${pct(row.serious)}%` }}
                  >
                    <span className="font-medium">{usd(row.serious)}</span>
                    {added > 0 && <span className="hidden text-xs text-muted-foreground sm:inline"> +{usd(added)}</span>}
                  </span>
                </span>

                {/* Readout on hover or keyboard focus. Every value is also in the table below. */}
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-[8rem] top-full z-10 mt-1 hidden w-52 rounded-md border bg-popover p-2.5 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block sm:left-[12rem]"
                >
                  <span className="mb-1 block font-medium">{country.name}</span>
                  {(
                    [
                      ['A healthy year', row.healthy, 'var(--series-1)'],
                      ['Having a baby', row.baby, null],
                      ['A serious illness', row.serious, 'var(--series-2)'],
                    ] as const
                  ).map(([label, value, color]) => (
                    <span key={label} className="flex items-center justify-between gap-3 py-0.5">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-0.5 w-3 rounded-full" style={{ background: color ?? 'var(--foreground)' }} />
                        {label}
                      </span>
                      <span className="font-semibold tabular-nums">{usd(value)}</span>
                    </span>
                  ))}
                  <span className="mt-1 flex justify-between border-t pt-1 text-muted-foreground">
                    <span>Illness adds</span>
                    <span className="tabular-nums">{usd(added)}</span>
                  </span>
                </span>
              </button>
            )
          })}

          {/* Axis labels. */}
          <div />
          <div className="relative mt-1 h-4 text-xs text-muted-foreground">
            {ticks.map((t) => (
              <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${pct(t)}%` }}>
                {t === 0 ? '$0' : `$${t / 1000}k`}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          The UK and Canada have no premiums, so their figures estimate the share of your taxes that pays for health care. The
          other countries' figures leave out the taxes that fund their public programs. Read high-income results with that in mind.
        </p>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View as a table</summary>
          <table className="mt-2 w-full text-left text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 font-normal">Country</th>
                <th className="py-1 text-right font-normal">Healthy year</th>
                <th className="py-1 text-right font-normal">Baby</th>
                <th className="py-1 text-right font-normal">Serious illness</th>
                <th className="py-1 text-right font-normal">Illness adds</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-1">{COUNTRIES[r.id].name}</td>
                  <td className="py-1 text-right">{usd(r.healthy)}</td>
                  <td className="py-1 text-right">{usd(r.baby)}</td>
                  <td className="py-1 text-right">{usd(r.serious)}</td>
                  <td className="py-1 text-right">{usd(r.serious - r.healthy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </CardContent>
    </Card>
  )
}
