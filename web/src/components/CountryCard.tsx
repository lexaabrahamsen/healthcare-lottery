import type { CostBreakdown } from '@engine'
import { COUNTRIES, getSource } from '@engine'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Chip } from '@/components/Chip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { usd } from '@/lib/format'

export function CountryCard({ result, showEmployer }: { result: CostBreakdown; showEmployer: boolean }) {
  const country = COUNTRIES[result.countryId]
  const total = showEmployer ? result.fullTotalUSD : result.visibleTotalUSD
  const items = showEmployer ? result.items : result.items.filter((i) => i.paidBy === 'you')

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-xl font-semibold">{country.name}</h3>
          <Chip tone={country.model}>{country.system}</Chip>
          {country.estimatesFromTaxes && (
            <Chip tone="outline" title="No premiums here, so this is an estimate of the share of your taxes that pays for health care">
              Estimate
            </Chip>
          )}
        </div>
        <CardTitle className="font-serif text-4xl font-semibold tabular-nums">{usd(total)}</CardTitle>
        <CardDescription>{showEmployer ? 'total cost, including employer share' : 'what you pay this year'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="multiple">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>
                <span className="flex flex-1 items-center justify-between gap-2 pr-2">
                  <span className="flex flex-wrap items-center gap-2">
                    {item.label}
                    {item.paidBy === 'employer' && <Chip tone="outline">Employer pays</Chip>}
                  </span>
                  <span className="tabular-nums">{usd(item.amountUSD)}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p className="font-mono text-xs">{item.derivation.formula}</p>
                <ul className="space-y-1">
                  {Object.entries(item.derivation.inputs).map(([name, input]) => (
                    <li key={name} className="flex flex-wrap items-center gap-x-2">
                      <span className="text-foreground">{name}:</span>
                      <span className="tabular-nums">
                        {input.value.toLocaleString('en-US')}
                        {input.unit ? ` ${input.unit}` : ''}
                      </span>
                      <Badge variant="outline">{getSource(input.sourceId).label}</Badge>
                      {input.note && <span className="basis-full text-xs">{input.note}</span>}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {(result.warnings.length > 0 || result.exclusions.length > 0) && (
          <>
            <Separator />
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              {result.warnings.map((w) => (
                <li key={w} className="text-foreground">{w}</li>
              ))}
              {result.exclusions.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
