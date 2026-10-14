import { Chip } from '@/components/Chip'
import { ShareButton } from '@/components/ShareButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { describeHousehold } from '@/lib/household'
import { usd } from '@/lib/format'
import { MAX_CHILDREN, MAX_INCOME } from '@/lib/urlState'

interface Props {
  income: number
  adults: 1 | 2
  children: number
  view: 'you' | 'full'
  isExample: boolean
  onIncome: (n: number) => void
  onAdults: (n: 1 | 2) => void
  onChildren: (n: number) => void
  onView: (v: 'you' | 'full') => void
  className?: string
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** The left-hand widget: everything about the household, always in view next to the results. */
export function HouseholdCard({ income, adults, children, view, isExample, onIncome, onAdults, onChildren, onView, className }: Props) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-sans text-xl font-bold">Your household</CardTitle>
          <Chip tone={isExample ? 'outline' : 'neutral'}>{isExample ? 'Example' : 'Yours'}</Chip>
        </div>
        <CardDescription>
          {capitalize(describeHousehold({ adults, children }))} earning {usd(income)} a year. Change it and everything updates.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="income">Annual income</Label>
            <Input
              id="income"
              type="text"
              inputMode="numeric"
              className="h-8 w-28 text-right font-display font-bold tabular-nums"
              value={`$${income.toLocaleString('en-US')}`}
              onChange={(e) => onIncome(Math.min(MAX_INCOME, Number(e.target.value.replace(/\D/g, '')) || 0))}
            />
          </div>
          <Slider min={0} max={300_000} step={1000} value={[Math.min(income, 300_000)]} onValueChange={([v]) => onIncome(v ?? 0)} />
          <p className="text-xs text-muted-foreground">One earner. Spouses and children are covered through that job.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Adults</Label>
            <ToggleGroup type="single" variant="outline" value={String(adults)} onValueChange={(v) => v && onAdults(Number(v) as 1 | 2)}>
              <ToggleGroupItem value="1">1</ToggleGroupItem>
              <ToggleGroupItem value="2">2</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="children">Children</Label>
            <Input
              id="children"
              type="number"
              min={0}
              max={MAX_CHILDREN}
              className="w-full"
              value={children}
              onChange={(e) => onChildren(Math.min(MAX_CHILDREN, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Show</Label>
          <ToggleGroup type="single" variant="outline" value={view} onValueChange={(v) => v && onView(v as 'you' | 'full')} className="w-full">
            <ToggleGroupItem value="you" className="flex-1">What you pay</ToggleGroupItem>
            <ToggleGroupItem value="full" className="flex-1">Incl. employer</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <ShareButton />
      </CardContent>
    </Card>
  )
}
