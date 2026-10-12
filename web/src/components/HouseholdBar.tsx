import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShareButton } from '@/components/ShareButton'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MAX_CHILDREN, MAX_INCOME } from '@/lib/urlState'

interface Props {
  income: number
  adults: 1 | 2
  children: number
  onIncome: (n: number) => void
  onAdults: (n: 1 | 2) => void
  onChildren: (n: number) => void
}

/** Sits right under the headline, so the household behind every number is always in view. */
export function HouseholdBar({ income, adults, children, onIncome, onAdults, onChildren }: Props) {
  return (
    <Card>
      <CardContent className="grid gap-x-8 gap-y-4 md:grid-cols-[1.6fr_auto_auto_auto] md:items-end">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="income">Annual income (one earner)</Label>
            <Input
              id="income"
              type="text"
              inputMode="numeric"
              className="h-8 w-32 text-right tabular-nums"
              value={`$${income.toLocaleString('en-US')}`}
              onChange={(e) => onIncome(Math.min(MAX_INCOME, Number(e.target.value.replace(/\D/g, '')) || 0))}
            />
          </div>
          <Slider min={0} max={300_000} step={1000} value={[Math.min(income, 300_000)]} onValueChange={([v]) => onIncome(v ?? 0)} />
        </div>

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
            className="w-20"
            value={children}
            onChange={(e) => onChildren(Math.min(MAX_CHILDREN, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
          />
        </div>

        <ShareButton />
      </CardContent>
    </Card>
  )
}
