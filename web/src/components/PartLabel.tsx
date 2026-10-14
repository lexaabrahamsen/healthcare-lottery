/** The heading style of a printed form: a heavy rule, then "PART n" and a title. */
export function PartLabel({ part, children }: { part: number; children: React.ReactNode }) {
  return (
    <div className="border-t-2 border-foreground pt-2">
      <p className="font-display text-sm font-bold uppercase tracking-wider">
        <span className="text-muted-foreground">Part {part}.</span> {children}
      </p>
    </div>
  )
}
