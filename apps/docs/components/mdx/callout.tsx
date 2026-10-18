import type { ReactNode } from 'react'
import { Alert } from 'topclassui/alert'

/** One sentence that matters, with the tone's own icon: `<Callout tone="info">`. */
export function Callout({ tone = 'info', children }: { tone?: 'info' | 'warning'; children?: ReactNode }) {
  return <Alert tone={tone}>{children}</Alert>
}
