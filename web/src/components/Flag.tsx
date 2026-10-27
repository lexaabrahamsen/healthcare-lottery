import { CA, CH, DE, GB, NL, US } from 'country-flag-icons/react/3x2'
import type { FlagComponent } from 'country-flag-icons/react/3x2'
import type { CountryId } from '@engine'
import { cn } from '@/lib/utils'

const FLAGS: Record<CountryId, FlagComponent> = { US, DE, UK: GB, CH, CA, NL }

/**
 * A country's flag as an inline SVG. Emoji flags don't render on Windows, so these are drawn instead.
 * Sized by height: pass a class like "h-4". Decorative by default, since the country name always sits beside it.
 */
export function Flag({ country, className }: { country: CountryId; className?: string }) {
  const Svg = FLAGS[country]
  return (
    <Svg
      aria-hidden
      className={cn('inline-block h-4 w-auto shrink-0 rounded-[3px] ring-1 ring-foreground/15', className)}
    />
  )
}
