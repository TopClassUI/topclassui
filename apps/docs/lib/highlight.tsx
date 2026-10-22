// One highlighter for MDX fences and demo sources, run at build time on the server (docs-site S3). Never in a client bundle.
import type { ReactNode } from 'react'
import { createHighlighter, type Highlighter } from 'shiki'

import { LANGS, ON_DARK, ON_LIGHT, TOKEN_ROLES, type TokenRole } from './shiki-themes'

export type CodeLang = (typeof LANGS)[number]

/** The class that sets a role's two colours in globals.css: a short class per token in place of a 60-byte style, in the HTML and the RSC payload. */
const TOKEN_CLASS: Record<TokenRole, string> = { text: 'tk-text', comment: 'tk-comment', keyword: 'tk-keyword', string: 'tk-string', attribute: 'tk-attribute', tag: 'tk-tag' }

const ROLE_OF = new Map(Object.entries(TOKEN_ROLES).map(([role, [dark, light]]) => [`${dark}|${light}`, role as TokenRole]))

type TokenProps = { className: string } | { style: Record<string, string> } | Record<string, never>

/** A token's role class; a pair the themes do not name keeps its inline style, and a token with no colour gets neither. */
function tokenProps(style: Record<string, string> | undefined): TokenProps {
  const dark = style?.['--tc-code-on-dark']
  const light = style?.['--tc-code-on-light']
  if (style === undefined || dark === undefined || light === undefined) return {}
  const role = ROLE_OF.get(`${dark}|${light}`.toLowerCase())
  return role !== undefined && Object.keys(style).length === 2 ? { className: TOKEN_CLASS[role] } : { style: { '--tc-code-on-dark': dark, '--tc-code-on-light': light } }
}

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
  return (
    <span className="shiki">
      {tokens.map((line, row) => (
        <span key={row} {...(line.length === 0 ? { 'data-blank': '' } : {})}>
          {line.map((token, column) => (
            <span key={column} {...tokenProps(token.htmlStyle)}>{token.content}</span>
          ))}
          {row < tokens.length - 1 ? '\n' : null}
        </span>
      ))}
    </span>
  )
}
