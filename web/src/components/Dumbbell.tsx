import type { AllResults } from '@engine'
import { COUNTRIES } from '@engine'
import { chartAxis, chartRows, tickLabel, totalFor } from '@/lib/chartData'
import { usd } from '@/lib/format'
import { cn } from '@/lib/utils'

const ROW = 3

/** The whole lottery in one view: for each country, where a healthy year and a serious illness land. The gap is the luck. */
export function Dumbbell({ all, showEmployer }: { all: AllResults; showEmployer: boolean }) {
  const base = chartRows(all, showEmployer)
  const { pct, ticks } = chartAxis(base)
  const rows = [...base].sort((a, b) => b.care.serious - b.care.healthy - (a.care.serious - a.care.healthy))

  return (
    <figure className="viz bg-card p-4 ring-1 ring-foreground/50">
      <figcaption className="space-y-2">
        <p className="font-display text-sm font-bold uppercase tracking-wider">Where the year can land</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full" style={{ background: 'var(--series-1)' }} />A healthy year
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-full border-[3px]" style={{ borderColor: 'var(--series-2)' }} />A serious illness
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-foreground/50" />
            The gap is how much of your bill is luck
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
          const healthy = totalFor(row, 'healthy')
          const serious = totalFor(row, 'serious')
          return (
            <div
              key={row.id}
              role="group"
              aria-label={`${country.name}: healthy year ${usd(healthy)}, serious illness ${usd(serious)}, a gap of ${usd(serious - healthy)}`}
              className={cn('col-span-2 grid grid-cols-subgrid items-center', row.id === 'US' && 'bg-muted')}
              style={{ height: `${ROW}rem` }}
            >
              <span className="min-w-0 pl-2">
                <span className={cn('block truncate text-sm', row.id === 'US' && 'font-bold')}>{country.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {country.estimatesFromTaxes ? 'Estimated from taxes' : country.system}
                </span>
              </span>

              <span className="relative block h-6">
                <span
                  className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-foreground/50"
                  style={{ left: `${pct(healthy)}%`, width: `${pct(serious) - pct(healthy)}%` }}
                />
                <span
                  className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
                  style={{ left: `${pct(healthy)}%`, background: 'var(--series-1)' }}
                  title={`Healthy year: ${usd(healthy)}`}
                />
                <span
                  className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] ring-2 ring-card"
                  style={{ left: `${pct(serious)}%`, borderColor: 'var(--series-2)' }}
                  title={`Serious illness: ${usd(serious)}`}
                />
                <span
                  className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-3 text-sm"
                  style={{ left: `${pct(serious)}%` }}
                >
                  <span className="font-display font-bold tabular-nums">+{usd(serious - healthy)}</span>
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
            {base.map((r) => (
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
