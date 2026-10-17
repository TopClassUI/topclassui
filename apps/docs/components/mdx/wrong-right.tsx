import { Children, isValidElement, type ReactNode } from 'react'
import { Icon } from 'topclassui/icon'

import type { Locale } from '../../content/pages'
import { CodeFence } from './code-fence'

export interface WrongRightProps {
  children?: ReactNode
  locale: Locale
  wrong: string
  right: string
  terminal: string
}

/** Two fences side by side, stacked under 48rem: the first titled Wrong, the second Right. */
export function WrongRight({ children, locale, wrong, right, terminal }: WrongRightProps) {
  const fences = Children.toArray(children).filter((child) => isValidElement<{ children?: ReactNode }>(child))
  const [bad, good] = fences.map((fence) => (fence as { props: { children?: ReactNode } }).props.children)
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <CodeFence locale={locale} terminal={terminal} title={<span className="inline-flex items-center gap-1.5"><Icon name="warning-circle" />{wrong}</span>}>{bad}</CodeFence>
      <CodeFence locale={locale} terminal={terminal} title={<span className="inline-flex items-center gap-1.5"><Icon name="check-circle" />{right}</span>}>{good}</CodeFence>
    </div>
  )
}
