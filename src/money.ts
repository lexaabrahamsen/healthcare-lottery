/** Round to cents. All arithmetic stays in floats and is rounded once per line item. */
export function roundCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function sumBy<T>(xs: readonly T[], f: (x: T) => number): number {
  return roundCents(xs.reduce((acc, x) => acc + f(x), 0));
}

export interface TaxBand {
  /** Upper edge of the band, in the same units as the income. Use Infinity for the top band. */
  upTo: number;
  rate: number;
}

/** Progressive tax: each band's rate applies only to the slice of income inside that band. */
export function bracketTax(income: number, bands: readonly TaxBand[]): number {
  let tax = 0;
  let lower = 0;
  for (const band of bands) {
    if (income <= lower) break;
    tax += (Math.min(income, band.upTo) - lower) * band.rate;
    lower = band.upTo;
  }
  return tax;
}
