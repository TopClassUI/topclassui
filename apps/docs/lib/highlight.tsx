// The one highlighter (docs-site S3): Shiki at build time, in a server component, never in a client bundle.
import type { ReactNode } from 'react'
import { type BundledLanguage, type Highlighter, createHighlighter } from 'shiki'

/** CodeBlock is dark on a light page and light on a dark one; measured over every demo: 8.45:1 and 4.62:1 (choice 14). */
export const CODE_THEMES = { onLight: 'github-dark-high-contrast', onDark: 'github-light-high-contrast' } as const

const LANGS = ['tsx', 'bash', 'css'] as const satisfies readonly BundledLanguage[]
export type CodeLang = (typeof LANGS)[number]

let highlighter: Promise<Highlighter> | null = null

function load(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: Object.values(CODE_THEMES), langs: [...LANGS] })
  return highlighter
}

/** Each token carries both colours as --tc-code-* variables; the site's CSS picks one with light-dark(). */
export async function highlight(code: string, lang: CodeLang = 'tsx'): Promise<ReactNode> {
  const { tokens } = (await load()).codeToTokens(code, {
    lang,
    themes: { light: CODE_THEMES.onLight, dark: CODE_THEMES.onDark },
    defaultColor: false,
    cssVariablePrefix: '--tc-code-',
  })
  return tokens.map((line, index) => (
    <span key={index}>
      {index > 0 ? '\n' : null}
      {line.map((token) => (
        <span
          key={token.offset}
          data-code-token=""
          style={{ '--tc-code-on-light': token.htmlStyle?.['--tc-code-light'], '--tc-code-on-dark': token.htmlStyle?.['--tc-code-dark'] }}
        >
          {token.content}
        </span>
      ))}
    </span>
  ))
}
