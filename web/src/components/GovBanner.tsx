/** A thin banner in the style of an official site, stating plainly that this is not one. */
export function GovBanner() {
  return (
    <div className="bg-primary text-primary-foreground dark:bg-secondary dark:text-foreground">
      <p className="mx-auto max-w-6xl px-4 py-1.5 text-xs">
        <span className="font-display font-bold uppercase tracking-wider">Independent analysis</span>
        <span className="mx-2 opacity-60">|</span>
        Built from public 2026 data. This is not an official government site.
      </p>
    </div>
  )
}
