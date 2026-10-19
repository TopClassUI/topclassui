import { Children, isValidElement, type ReactNode } from 'react'
import { BORDER_WIDTH } from 'topclassui/classes'
import { CodeBlock } from 'topclassui/code-block'
import { Icon } from 'topclassui/icon'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { highlight } from '../../lib/highlight'
import { fenceOf } from './code-fence'

export interface WrongRightProps {
  children?: ReactNode
  locale: Locale
  wrong: string
  right: string
}

const SIDES = {
  wrong: { icon: 'warning-circle', text: 'text-danger-on-soft', edge: 'border-danger-solid' },
  right: { icon: 'check-circle', text: 'text-success-on-soft', edge: 'border-success-solid' },
} as const

async function Side({ fence, side, word, locale }: { fence: ReactNode; side: keyof typeof SIDES; word: string; locale: Locale }) {
  const { code, lang } = fenceOf(fence)
  const highlighted = await highlight(code, lang)
  const look = SIDES[side]
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${look.text}`}><Icon name={look.icon} />{word}</span>
      <CodeBlock
        {...getLabels(locale)}
        lang={lang}
        showCopy={false}
        wrap
        highlighted={highlighted ?? undefined}
        className={`${BORDER_WIDTH} ${look.edge}`}
      >
        {code}
      </CodeBlock>
    </div>
  )
}

/** Two fences side by side as the frames draw them, stacked under 48rem: the word above each, its tone on the edge, and long lines wrapped. */
export function WrongRight({ children, locale, wrong, right }: WrongRightProps) {
  const fences = Children.toArray(children).filter((child) => isValidElement<{ children?: ReactNode }>(child))
  const [bad, good] = fences.map((fence) => (fence as { props: { children?: ReactNode } }).props.children)
  return (
    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2">
      <Side fence={bad} side="wrong" word={wrong} locale={locale} />
      <Side fence={good} side="right" word={right} locale={locale} />
    </div>
  )
}
