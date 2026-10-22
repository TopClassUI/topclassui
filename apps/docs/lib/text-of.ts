import { isValidElement, type ReactNode } from 'react'

/** The plain text of a React tree: the heading text an id and an anchor name are built from. */
export function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/** `title="app/globals.css" check` → { title: 'app/globals.css', check: true }. */
export function parseMeta(meta: string | undefined): { title?: string; check: boolean } {
  if (meta === undefined) return { check: false }
  const title = /title="([^"]*)"/.exec(meta)?.[1]
  const check = /(^|\s)check(\s|$)/.test(meta.replace(/title="[^"]*"/, ''))
  return title === undefined ? { check } : { title, check }
}

/** The lines a fence shows when its info string says `show="5-8"`, dedented; the `check` compile still reads the whole fence. */
export function shownOf(code: string, meta: string | undefined): string {
  const range = /show="(\d+)-(\d+)"/.exec(meta ?? '')
  if (range === null) return code
  const lines = code.split('\n').slice(Number(range[1]) - 1, Number(range[2]))
  const indent = Math.min(...lines.filter((line) => line.trim() !== '').map((line) => /^ */.exec(line)?.[0].length ?? 0))
  return lines.map((line) => line.slice(indent)).join('\n')
}
