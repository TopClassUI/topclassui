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
