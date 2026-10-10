import type { Household } from '@engine'
import { usd } from '@/lib/format'

/** "a family of 4", "a single parent with 2 children", and so on. */
export function describeHousehold({ adults, children }: Household): string {
  if (children === 0) return adults === 1 ? 'a single person' : 'a couple'
  if (adults === 1) return `a single parent with ${children} ${children === 1 ? 'child' : 'children'}`
  return `a family of ${children + 2}`
}

export const describeIncome = (income: number) => `earning ${usd(income)} a year`
