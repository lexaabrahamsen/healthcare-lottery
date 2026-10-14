import type { FundingModel } from '@engine'
import { cn } from '@/lib/utils'

/** Funding models each get a hue, so the same kind of system looks the same everywhere. */
const TONES = {
  neutral: 'bg-muted text-foreground',
  outline: 'border border-foreground/25 text-muted-foreground',
  employer: 'bg-violet-100 text-violet-900 dark:bg-violet-400/15 dark:text-violet-300',
  payroll: 'bg-teal-100 text-teal-900 dark:bg-teal-400/15 dark:text-teal-300',
  tax: 'bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-300',
  private: 'bg-rose-100 text-rose-900 dark:bg-rose-400/15 dark:text-rose-300',
} satisfies Record<'neutral' | 'outline' | FundingModel, string>

export type ChipTone = keyof typeof TONES

export function Chip({ tone = 'neutral', className, ...props }: React.ComponentProps<'span'> & { tone?: ChipTone }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center whitespace-nowrap rounded-sm px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide',
        TONES[tone],
        className,
      )}
      {...props}
    />
  )
}
