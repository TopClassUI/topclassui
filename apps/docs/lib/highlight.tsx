// One highlighter for MDX fences and demo sources, run at build time on the server (docs-site S3). Never in a client bundle.
import type { ReactNode } from 'react'
import { createHighlighter, type Highlighter } from 'shiki'

import { LANGS, ON_DARK, ON_LIGHT } from './shiki-themes'

export type CodeLang = (typeof LANGS)[number]

let highlighter: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: [ON_DARK, ON_LIGHT], langs: [...LANGS] })
  return highlighter
}

const ALIASES: Record<string, (typeof LANGS)[number]> = { sh: 'bash', shell: 'bash', typescript: 'ts', javascript: 'js', mjs: 'js' }

function langOf(lang: string | undefined): (typeof LANGS)[number] | null {
  if (lang === undefined) return null
  const known = (LANGS as readonly string[]).includes(lang) ? (lang as (typeof LANGS)[number]) : ALIASES[lang]
  return known ?? null
}

/** Which lines belong to an import statement, from its import line through its from line, so the flat code can mute them as one. */
export function importRowsOf(lines: readonly string[]): boolean[] {
  let open = false
  return lines.map((line) => {
    if (!open && /^import\b/.test(line)) open = true
    const inside = open
    if (open && /(?:\bfrom\s*|^import\s*)['"][^'"]*['"];?\s*$/.test(line)) open = false
    return inside
  })
}

/** The code as coloured spans for CodeBlock's `highlighted`; plain text when the language is not loaded. */
export async function highlight(code: string, lang?: string): Promise<ReactNode> {
  const known = langOf(lang)
  if (known === null) return null
  const { tokens } = (await getHighlighter()).codeToTokens(code, {
    lang: known,
    themes: { 'on-dark': ON_DARK.name ?? 'on-dark', 'on-light': ON_LIGHT.name ?? 'on-light' },
    defaultColor: false,
    cssVariablePrefix: '--tc-code-',
  })
  const imports = importRowsOf(tokens.map((line) => line.map((token) => token.content).join('')))
  return (
    <span className="shiki">
      {tokens.map((line, row) => (
        <span key={row} data-blank={line.length === 0 ? '' : undefined} data-import={imports[row] === true ? '' : undefined}>
          {line.map((token, column) => (
            <span key={column} style={{ '--tc-code-on-dark': token.htmlStyle?.['--tc-code-on-dark'], '--tc-code-on-light': token.htmlStyle?.['--tc-code-on-light'] }}>{token.content}</span>
          ))}
          {row < tokens.length - 1 ? '\n' : null}
        </span>
      ))}
    </span>
  )
}
