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

// The name sits above each box in its tone, and the box takes that tone as its edge (docs frames, CSS entry and Provider).
const NAME = 'inline-flex items-center gap-1.5 text-xs font-semibold'
const NAME_TONE = { wrong: 'text-danger-on-soft', right: 'text-success-on-soft' } as const
const EDGE = { wrong: 'docs-bare docs-wrong', right: 'docs-bare docs-right' } as const

/** Two fences side by side, stacked under 48rem: the first titled Wrong, the second Right; a long line wraps, since each pane is half the column. */
export function WrongRight({ children, locale, wrong, right, terminal }: WrongRightProps) {
  const fences = Children.toArray(children).filter((child) => isValidElement<{ children?: ReactNode }>(child))
  const [bad, good] = fences.map((fence) => (fence as { props: { children?: ReactNode } }).props.children)
  const sides = [
    { key: 'wrong', name: wrong, icon: 'warning-circle', code: bad },
    { key: 'right', name: right, icon: 'check-circle', code: good },
  ] as const
  return (
    <div className="grid grid-cols-1 items-start gap-3.5 md:grid-cols-2">
      {sides.map((side) => (
        <div key={side.key} className="grid min-w-0 gap-2">
          <span aria-hidden="true" className={`${NAME} ${NAME_TONE[side.key]}`}><Icon name={side.icon} />{side.name}</span>
          <CodeFence locale={locale} terminal={terminal} title={side.name} copy={false} wrap className={EDGE[side.key]}>{side.code}</CodeFence>
        </div>
      ))}
    </div>
  )
}
