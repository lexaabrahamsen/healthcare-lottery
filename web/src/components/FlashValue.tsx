import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Wraps a figure and highlights it briefly, but only when the household inputs changed AND this figure's own
 * value changed with them. So switching tabs never flashes, and unchanged figures stay still: an income edit
 * lights up exactly the numbers it moved.
 */
export function FlashValue({
  value,
  inputsKey,
  className,
  children,
}: {
  value: string | number
  inputsKey: string
  className?: string
  children: React.ReactNode
}) {
  const prev = useRef({ value, inputsKey })
  const count = useRef(0)
  const changed = prev.current.inputsKey !== inputsKey && prev.current.value !== value
  if (changed) count.current += 1
  useEffect(() => {
    prev.current = { value, inputsKey }
  })
  // A new key remounts the element, which replays the highlight on every change.
  return (
    <span key={count.current} className={cn(count.current > 0 && changed && 'changed-flash', className)}>
      {children}
    </span>
  )
}
