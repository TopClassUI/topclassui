import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { TABS_LIST, TABS_PANEL, TABS_ROOT, TABS_SIZE, TABS_TAB } from '../classes.js'

/** Every class Tabs writes, once: the same set tabs.css.test.ts checks one by one. */
const WRITTEN = [...new Set(
  [TABS_ROOT, ...Object.values(TABS_LIST), ...Object.values(TABS_TAB), TABS_PANEL, ...Object.values(TABS_SIZE)].join(' ').split(' '),
)].filter(Boolean)

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** Where the selector of a class starts in the sheet, which is the order the cascade reads it in. */
const at = (css: string, cls: string) => css.indexOf(`.${escape(cls)}`)

/** The query a class sits inside, read back from the sheet: '' when it sits in none. */
function queryOf(css: string, cls: string): string {
  const from = at(css, cls)
  const before = css.slice(css.lastIndexOf('@media (', from), from).replace(/\s+/g, ' ')
  // Still inside that block: one more brace opened than closed between the query and the selector.
  return before.split('{').length - before.split('}').length === 1 ? before.slice(0, before.indexOf('{')).trim() : ''
}

const css = compileEntry().then((compiled) => compiled.build(WRITTEN))

describe('a class that only applies under a query sits inside it', () => {
  it('every forced-colors class sits inside the forced-colours query, and no other class does', async () => {
    const sheet = await css
    const forced = WRITTEN.filter((cls) => queryOf(sheet, cls) === '@media (forced-colors: active)')
    expect(forced.sort()).toEqual([
      'forced-colors:border-[Canvas]', 'forced-colors:border-b-(length:--tc-line-width)',
      'forced-colors:data-active:[--tc-ring:HighlightText]', 'forced-colors:data-active:bg-[Highlight]',
      'forced-colors:data-active:border-[Highlight]', 'forced-colors:data-active:forced-color-adjust-none',
      'forced-colors:data-active:shadow-none', 'forced-colors:data-active:text-[HighlightText]',
      'forced-colors:data-disabled:*:opacity-100', 'forced-colors:data-disabled:not-data-active:text-[GrayText]',
      'forced-colors:outline-(length:--tc-line-width)',
    ])
  })

  it('the two 44 px floors sit inside the coarse-pointer query, so a mouse keeps the 24 px floor', async () => {
    const sheet = await css
    const coarse = WRITTEN.filter((cls) => queryOf(sheet, cls) === '@media (pointer: coarse)')
    expect(coarse.sort()).toEqual([
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
    ])
  })

  it('the scan reads no query around a class that sits in none', () => {
    expect(queryOf('.a { top: 0; }', 'a')).toBe('')
    expect(queryOf('@media (pointer: coarse) { .a { top: 0; } } .b { top: 0; }', 'b')).toBe('')
    expect(queryOf('@media (pointer: coarse) { .a { top: 0; } }', 'a')).toBe('@media (pointer: coarse)')
  })
})

// Two rules of equal weight on one element: the later one in the sheet is the one the browser takes.
describe('the order the cascade needs', () => {
  const follows = async (later: string, earlier: string) => {
    const sheet = await css
    expect(at(sheet, earlier), earlier).toBeGreaterThan(-1)
    expect(at(sheet, later), `${later} must come after ${earlier}`).toBeGreaterThan(at(sheet, earlier))
  }

  it('under forced colours the bar of the active tab takes the highlight after it took the primary colour', async () => {
    await follows('forced-colors:data-active:border-[Highlight]', 'data-active:border-primary-solid')
  })

  it('under forced colours the active enclosed tab takes the system pair after its raised surface and its body colour', async () => {
    await follows('forced-colors:data-active:bg-[Highlight]', 'data-active:bg-surface-raised')
    await follows('forced-colors:data-active:text-[HighlightText]', 'data-active:text-body')
    await follows('forced-colors:data-active:shadow-none', 'data-active:shadow-sm')
  })

  it('under forced colours what a disabled tab holds is opaque again, after it was dimmed', async () => {
    await follows('forced-colors:data-disabled:*:opacity-100', 'data-disabled:*:opacity-50')
  })

  it('under a finger the 44 px floor comes after the 24 px one', async () => {
    await follows('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'min-h-[var(--tc-target-min,24px)]')
    await follows('pointer-coarse:min-w-[var(--tc-target-coarse,44px)]', 'min-w-[var(--tc-target-min,24px)]')
  })

  it('the bar of a tab that is not active is the page under forced colours, by one class against one', async () => {
    await follows('forced-colors:border-[Canvas]', 'border-transparent')
  })
})

describe('the tokens Tabs reads are declared, with the values the measurements were taken at', () => {
  it('--tc-line-width is 1px and --tc-ring-width 2px: the line a bar covers, and the ring inside a tab', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-line-width: 1px;')
    expect(sheet).toContain('--tc-ring-width: 2px;')
    expect(sheet).toContain('--tc-ring-offset: 2px;')
  })

  it('--tc-duration is 150 ms times --tc-motion, which reduced motion sets to 0', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-duration-base: calc(150ms * var(--tc-motion));')
    expect(sheet.replace(/\s+/g, ' ')).toContain('@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0; } }')
  })
})
