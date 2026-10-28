import { Chip } from '@/components/Chip'
import { ShareButton } from '@/components/ShareButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
}

/** The inputs, as a slim band across the top of the dashboard. Everything below it is computed from these. */
export function HouseholdBand({ income, adults, children, view, isExample, onIncome, onAdults, onChildren, onView }: Props) {
  return (
    <div className="space-y-3 bg-muted/50 p-4 pb-7 sm:px-5 sm:pb-7">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold">Your household</h2>
        <Chip tone={isExample ? 'outline' : 'neutral'}>{isExample ? 'Example' : 'Yours'}</Chip>
        <span className="hidden text-sm text-muted-foreground sm:inline">One earner. Spouses and children are covered through that job.</span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1.5fr)_auto_auto_auto_auto] lg:items-end">
        <div className="col-span-2 space-y-2 lg:col-span-1">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="income">Annual income</Label>
            <Input
              id="income"
              type="text"
              inputMode="numeric"
              className="h-8 w-28 bg-background text-right font-display font-bold tabular-nums"
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
            className="w-20 bg-background"
            value={children}
            onChange={(e) => onChildren(Math.min(MAX_CHILDREN, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
          />
        </div>

        <div className="col-span-2 space-y-2 lg:col-span-1">
          <Label>Show</Label>
          <ToggleGroup type="single" variant="outline" value={view} onValueChange={(v) => v && onView(v as 'you' | 'full')}>
            <ToggleGroupItem value="you">What you pay</ToggleGroupItem>
            <ToggleGroupItem value="full">Incl. employer</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="col-span-2 lg:col-span-1 [&>button]:w-full lg:[&>button]:w-auto">
          <ShareButton />
        </div>
      </div>
    </div>
  )
}
