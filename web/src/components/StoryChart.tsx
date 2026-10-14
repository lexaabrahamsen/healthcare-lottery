import type { AllResults, ScenarioId } from '@engine'
import type { CountryId } from '@engine'
import { COUNTRIES } from '@engine'
import { chartAxis, chartRows, tickLabel, totalFor } from '@/lib/chartData'
import { usd } from '@/lib/format'
import { cn } from '@/lib/utils'

const GAP = 2 // px of surface color between the two segments
const ROW = 3 // rem per row

interface Props {
  all: AllResults
  showEmployer: boolean
  /** The scenario whose care costs are added on top of coverage. Null shows coverage alone. */
  scenario: ScenarioId | null
  caption: string
  /** The comparison country: its row is highlighted along with the US. */
  highlight?: CountryId
}

/** Each country's bill as two parts: the price of being covered, then what you pay when you use care. */
export function StoryChart({ all, showEmployer, scenario, caption, highlight }: Props) {
  const rows = chartRows(all, showEmployer)
  const { pct, ticks } = chartAxis(rows)

  return (
    <figure className="viz" aria-label={caption}>
      <figcaption className="space-y-2">
        <p className="font-display text-sm font-bold">{caption}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5" style={{ background: 'var(--series-1)' }} />
            Coverage: the price of being covered
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5" style={{ background: 'var(--series-2)' }} />
            Care: what you pay when you use it
          </li>
        </ul>
      </figcaption>

      <div className="mt-3 grid grid-cols-[7.5rem_1fr] gap-x-3 sm:grid-cols-[13rem_1fr]">
        <div />
        <div className="relative h-0">
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute top-0 w-px"
              style={{ left: `${pct(t)}%`, height: `${rows.length * ROW}rem`, background: t === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)' }}
            />
          ))}
        </div>

        {rows.map((row) => {
          const country = COUNTRIES[row.id]
          const care = scenario ? row.care[scenario] : 0
          const total = totalFor(row, scenario)
          return (
            <div
              key={row.id}
              role="group"
              aria-label={`${country.name}: coverage ${usd(row.coverage)}${scenario ? `, care ${usd(care)}` : ''}, total ${usd(total)}`}
              className={cn('col-span-2 grid grid-cols-subgrid items-center rounded-lg', (row.id === 'US' || row.id === highlight) && 'bg-muted')}
              style={{ height: `${ROW}rem` }}
            >
              <span className="min-w-0 pl-2">
                <span className={cn('block truncate text-sm', (row.id === 'US' || row.id === highlight) && 'font-semibold')}>{country.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {country.estimatesFromTaxes ? 'Estimated from taxes' : country.system}
                </span>
              </span>

              <span className="relative block h-6">
                <span
                  className="absolute inset-y-0 left-0 motion-safe:transition-[width] motion-safe:duration-500"
                  style={{ width: `${pct(row.coverage)}%`, background: 'var(--series-1)', borderRadius: care > 0 ? 0 : '0 4px 4px 0' }}
                />
                <span
                  className="absolute inset-y-0 rounded-r-[4px] motion-safe:transition-[width] motion-safe:duration-500"
                  style={{
                    left: `calc(${pct(row.coverage)}% + ${GAP}px)`,
                    width: care > 0 ? `max(calc(${pct(care)}% - ${GAP}px), 3px)` : '0px',
                    background: 'var(--series-2)',
                  }}
                />
                <span
                  className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-2 text-sm tabular-nums motion-safe:transition-[left] motion-safe:duration-500"
                  style={{ left: `${pct(total)}%` }}
                >
                  <span className="font-display font-bold">{usd(total)}</span>
                  {care > 0 && <span className="hidden text-xs text-muted-foreground sm:inline"> {usd(care)} care</span>}
                </span>
              </span>
            </div>
          )
        })}

        <div />
        <div className="relative mt-1 h-4 text-xs text-muted-foreground">
          {ticks.map((t) => (
            <span key={t} className="absolute -translate-x-1/2 tabular-nums" style={{ left: `${pct(t)}%` }}>
              {tickLabel(t)}
            </span>
          ))}
        </div>
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View the numbers as a table</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 font-normal">Country</th>
              <th className="py-1 text-right font-normal">Coverage</th>
              <th className="py-1 text-right font-normal">Care, healthy</th>
              <th className="py-1 text-right font-normal">Care, baby</th>
              <th className="py-1 text-right font-normal">Care, serious illness</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-1">{COUNTRIES[r.id].name}</td>
                <td className="py-1 text-right">{usd(r.coverage)}</td>
                <td className="py-1 text-right">{usd(r.care.healthy)}</td>
                <td className="py-1 text-right">{usd(r.care.baby)}</td>
                <td className="py-1 text-right">{usd(r.care.serious)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
