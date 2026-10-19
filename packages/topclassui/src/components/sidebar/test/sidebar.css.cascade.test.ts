import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import * as classes from '../classes.js'

/** Every class Sidebar writes, once: the same set sidebar.css.test.ts checks one by one. */
const WRITTEN = [...new Set(
  Object.values(classes).flatMap((value) => (typeof value === 'string' ? [value] : Object.values(value))).join(' ').split(' '),
)].filter(Boolean)

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** Where the selector of a class starts in the sheet, which is the order the cascade reads it in. */
function at(css: string, cls: string): number {
  const selector = `.${escape(cls)}`
  for (let from = css.indexOf(selector); from !== -1; from = css.indexOf(selector, from + 1)) {
    if (!/[\w\\-]/.test(css[from + selector.length] ?? '')) return from
  }
  return -1
}

/** The query a class sits inside, read back from the sheet: '' when it sits in none. */
function queryOf(css: string, cls: string): string {
  const from = at(css, cls)
  const before = css.slice(css.lastIndexOf('@media (', from), from).replace(/\s+/g, ' ')
  // Still inside that block: one more brace opened than closed between the query and the selector.
  return before.split('{').length - before.split('}').length === 1 ? before.slice(0, before.indexOf('{')).trim() : ''
}

const css = compileEntry().then((compiled) => compiled.build(WRITTEN))

describe('a class that only applies under a query sits inside it', () => {
  it('the four forced-colors classes of the current row sit inside the forced-colours query, and no other class does', async () => {
    const sheet = await css
    expect(WRITTEN.filter((cls) => queryOf(sheet, cls) === '@media (forced-colors: active)').sort()).toEqual([
      'forced-colors:[--tc-ring:CanvasText]', 'forced-colors:bg-[Highlight]', 'forced-colors:forced-color-adjust-none',
      'forced-colors:text-[HighlightText]',
    ])
  })

  it('the 44 px floors and the 65 px of a collapsed rail sit inside the coarse-pointer query, so a mouse keeps 24 and 60 px', async () => {
    const sheet = await css
    expect(WRITTEN.filter((cls) => queryOf(sheet, cls) === '@media (pointer: coarse)').sort()).toEqual([
      'pointer-coarse:data-closed:min-w-[calc(var(--tc-target-coarse,44px)+1.25rem+var(--tc-line-width))]',
      'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
    ])
  })

  it('the hover fill sits inside the hover query, so a finger never leaves a row filled', async () => {
    const sheet = await css
    expect(WRITTEN.filter((cls) => queryOf(sheet, cls) === '@media (hover: hover)')).toEqual(['hover:bg-(--tc-soft)'])
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

  it('under a finger the 44 px floor of a row comes after the 32 px of its height, and after the 24 px floor', async () => {
    await follows('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'min-h-(--tc-row-height)')
    await follows('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'min-h-[var(--tc-target-min,24px)]')
    await follows('pointer-coarse:min-w-[var(--tc-target-coarse,44px)]', 'min-w-[var(--tc-target-min,24px)]')
  })

  it('under forced colours the current row takes the system pair after it took the soft primary pair', async () => {
    await follows('forced-colors:bg-[Highlight]', 'bg-primary-soft')
    await follows('forced-colors:text-[HighlightText]', 'text-primary-on-soft')
  })

  it('a focused row takes a solid outline after it was given none', async () => {
    await follows('focus-visible:outline-solid', 'outline-none')
  })
})

// Unequal weight: the selector of a collapsed-rail class holds an attribute more, so it wins wherever it sits.
describe('what a collapsed rail overrides, it overrides by weight and not by order', () => {
  const selectorOf = async (cls: string) => {
    const sheet = await css
    const from = at(sheet, cls)
    return sheet.slice(from, sheet.indexOf('{', from)).trim()
  }

  it('each collapsed-rail class is one class and one attribute: heavier than the plain class it replaces', async () => {
    for (const cls of WRITTEN.filter((name) => name.startsWith('group-data-closed/sidebar:'))) {
      expect(await selectorOf(cls), cls).toBe(`.${escape(cls)}:is(:where(.group\\/sidebar)[data-closed] *)`)
    }
    expect(await selectorOf('px-3')).toBe('.px-3')
    expect(await selectorOf('truncate')).toBe('.truncate')
    expect(await selectorOf('py-1')).toBe('.py-1')
  })

  it('there are three of them: a hidden label, the scrollbar of the body, and what is centred: the toggle and the icon of a row', () => {
    expect(WRITTEN.filter((name) => name.startsWith('group-data-closed/sidebar:')).sort()).toEqual([
      'group-data-closed/sidebar:[scrollbar-width:none]', 'group-data-closed/sidebar:justify-center',
      'group-data-closed/sidebar:sr-only',
    ])
  })

  it('the two widths are one class and one attribute each, so a width the caller writes for one state leaves the other', async () => {
    expect(await selectorOf('data-open:w-55')).toBe('.data-open\\:w-55[data-open]')
    expect(await selectorOf('data-closed:w-15')).toBe('.data-closed\\:w-15[data-closed]')
  })
})

describe('the tokens Sidebar reads are declared, with the values the measurements were taken at', () => {
  it('a row is 2rem tall times the density, a target 24 px and 44 under a finger', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-row-height: calc(2rem * var(--tc-density));')
    expect(sheet).toContain('--tc-target-min: 24px;')
    expect(sheet).toContain('--tc-target-coarse: 44px;')
  })

  it('a ring is 2 px wide and 2 px away, which is the 4 px the body keeps clear, and a line is 1 px', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-ring-width: 2px;')
    expect(sheet).toContain('--tc-ring-offset: 2px;')
    expect(sheet).toContain('--tc-line-width: 1px;')
  })

  it('--tc-duration is 150 ms times --tc-motion, which reduced motion sets to 0', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-duration-base: calc(150ms * var(--tc-motion));')
    expect(sheet.replace(/\s+/g, ' ')).toContain('@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0; } }')
  })
})
