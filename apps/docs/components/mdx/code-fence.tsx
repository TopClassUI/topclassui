import { isValidElement, type ReactNode } from 'react'

import type { Locale } from '../../content/pages'
import { labelsFor } from '../../labels/index'
import { highlight } from '../../lib/highlight'
import { parseMeta, shownOf } from '../../lib/text-of'
import { CodeFrame } from './code-frame'

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
  title?: string
  /** Read after a title the page shows again, so the regions and copy buttons are told apart: ", version 2". */
  repeat?: (count: number) => string
  /** false leaves out the Copy button, as WrongRight's bare panes do. */
  copy?: boolean
  /** Long lines break instead of scrolling. */
  wrap?: boolean
  /** Added to DOCS_CODE, as WrongRight's tone edge is. */
  className?: string
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

/** A fenced block: CodeBlock with Shiki's colours from build time, named by its file, its language or "code" (docs-site S3). */
export async function CodeFence({ children, locale, terminal, title, repeat, copy = true, wrap = false, className }: CodeFenceProps) {
  const { code: whole, lang, meta, repeat: count } = fenceOf(children)
  const code = shownOf(whole, meta)
  const named = title ?? parseMeta(meta).title ?? (lang === undefined ? labelsFor(locale).blocks.code : SHELL.has(lang) ? terminal : lang)
  const highlighted = await highlight(code, lang)
  return (
    <CodeFrame
      code={code}
      locale={locale}
      title={named}
      repeat={count === null || repeat === undefined ? undefined : repeat(count)}
      lang={lang}
      highlighted={highlighted}
      copy={copy ? code : false}
      wrap={wrap}
      className={className}
    />
  )
}
