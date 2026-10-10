import { useState } from 'react'
import { Check, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Copies the current URL, which already carries the household and choices. */
export function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context or permissions): the address bar already has the link.
      window.prompt('Copy this link:', window.location.href)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {copied ? <Check /> : <Link />}
      {copied ? 'Link copied' : 'Copy link'}
    </Button>
  )
}
