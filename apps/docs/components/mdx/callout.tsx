import type { ReactNode } from 'react'
import { Alert } from 'topclassui/alert'
import { Icon } from 'topclassui/icon'

/** One sentence that matters: `<Callout tone="info">`. A warning takes the frames' warning circle, and a name in code keeps the tone's colour. */
export function Callout({ tone = 'info', children }: { tone?: 'info' | 'warning'; children?: ReactNode }) {
  return <Alert tone={tone} icon={tone === 'warning' ? <Icon name="warning-circle" /> : undefined} className="[&_code]:text-current">{children}</Alert>
}
