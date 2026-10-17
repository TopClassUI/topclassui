// On this page: each `##` heading of an MDX page and the id the h2 mapping gives it.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { slugify } from '../../lib/slug.js'

export interface TocEntry {
  text: string
  id: string
}

export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]

/** `##` lines only, outside fenced code; a trailing `#` run and inline code ticks are dropped from the text. */
export function headingsOf(mdx: string): TocEntry[] {
  const found: TocEntry[] = []
  let fence: string | null = null
  for (const line of mdx.split(/\r?\n/)) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
    if (marker !== undefined) {
      if (fence === null) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null
      continue
    }
    if (fence !== null) continue
    const heading = /^##[ \t]+(.+?)[ \t#]*$/.exec(line)?.[1]
    if (heading === undefined) continue
    const text = heading.replace(/`/g, '')
    found.push({ text, id: slugify(text) })
  }
  return found
}

/** Ids repeated on one page get -2, -3, so every anchor stays unique. */
export function uniqueIds(entries: TocEntry[]): TocEntry[] {
  const seen = new Map<string, number>()
  return entries.map((entry) => {
    const count = (seen.get(entry.id) ?? 0) + 1
    seen.set(entry.id, count)
    return count === 1 ? entry : { ...entry, id: `${entry.id}-${String(count)}` }
  })
}

export type Toc = Record<Locale, Record<string, TocEntry[]>>

/** Every `content/<locale>/<page>.mdx`, keyed by locale and page. */
export function tocOf(contentDir: string): Toc {
  const toc: Toc = { en: {}, ar: {} }
  for (const locale of LOCALES) {
    const dir = join(contentDir, locale)
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx')).sort()) {
      toc[locale][file.slice(0, -4)] = uniqueIds(headingsOf(readFileSync(join(dir, file), 'utf8')))
    }
  }
  return toc
}
