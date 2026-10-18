import { isValidElement, type ReactNode } from 'react'
import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { highlight } from '../../lib/highlight'
import { parseMeta } from '../../lib/text-of'

interface CodeProps {
  className?: string
  children?: ReactNode
  'data-meta'?: string
  'data-repeat'?: string
}

export interface CodeFenceProps {
  children?: ReactNode
  locale: Locale
  /** "terminal" for a shell fence with no title of its own. */
  terminal: string
  /** Overrides the info string's title, as WrongRight does. */
  title?: ReactNode
  /** Read after a title the page shows again, so the regions and copy buttons are told apart: ", version 2". */
  repeat?: (count: number) => string
}

const SHELL = new Set(['bash', 'sh', 'shell'])

/** The `pre` of an MDX fence, read once: the code, its language and its info string. */
export function fenceOf(children: ReactNode): { code: string; lang: string | undefined; meta: string | undefined; repeat: number | null } {
  const code = isValidElement<CodeProps>(children) ? children : null
  const text = typeof code?.props.children === 'string' ? code.props.children : ''
  return {
    code: text.replace(/\n$/, ''),
    lang: /language-(\S+)/.exec(code?.props.className ?? '')?.[1],
    meta: code?.props['data-meta'],
    repeat: code?.props['data-repeat'] === undefined ? null : Number(code.props['data-repeat']),
  }
}

/** A fenced block: CodeBlock with Shiki's colours from build time and its own copy button (docs-site S3). */
export async function CodeFence({ children, locale, terminal, title, repeat }: CodeFenceProps) {
  const { code, lang, meta, repeat: count } = fenceOf(children)
  const parsed = parseMeta(meta)
  const named = title ?? parsed.title ?? (lang !== undefined && SHELL.has(lang) ? terminal : undefined)
  const shown = count === null || repeat === undefined ? named : <>{named}<span className="sr-only">{repeat(count)}</span></>
  const highlighted = await highlight(code, lang)
  return (
    <CodeBlock {...getLabels(locale)} lang={lang} title={shown} highlighted={highlighted ?? undefined}>
      {code}
    </CodeBlock>
  )
}
