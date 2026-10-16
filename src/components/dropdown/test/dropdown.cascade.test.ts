import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { DROPDOWN_ITEM, DROPDOWN_ITEM_TONE, DROPDOWN_POPUP, DROPDOWN_POSITIONER, DROPDOWN_SHORTCUT } from '../classes.js'

/** Every class of the strings whose rules meet on one element: the row with each tone, its shortcut, the menu. */
const CLASSES = [DROPDOWN_POSITIONER, DROPDOWN_POPUP, DROPDOWN_ITEM, DROPDOWN_ITEM_TONE.danger, DROPDOWN_SHORTCUT].join(' ').split(' ')

const css = compileEntry().then((compiled) => compiled.build(CLASSES))
const flat = css.then((sheet) => sheet.replace(/\s+/g, ' '))

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** Where the rule of one class opens: its escaped name followed by what can follow a class in a selector. */
function ruleStart(sheet: string, cls: string): number {
  const name = `.${escape(cls)}`
  for (let at = sheet.indexOf(name); at !== -1; at = sheet.indexOf(name, at + 1)) {
    if (/[\s{:[>]/.test(sheet[at + name.length] ?? '')) return at
  }
  return -1
}

/** Whether the rule of the first class is emitted before the rule of the second. False when either has none. */
async function before(first: string, second: string): Promise<boolean> {
  const sheet = await css
  const [a, b] = [ruleStart(sheet, first), ruleStart(sheet, second)]
  return a !== -1 && b !== -1 && a < b
}

describe('what each selector reaches', () => {
  it('a disabled row dims its children and never itself: its highlight keeps its strength', async () => {
    expect(await flat).toContain(':is(.data-disabled\\:\\*\\:opacity-50[data-disabled] > *) { opacity: 50%; }')
    expect(CLASSES).not.toContain('data-disabled:opacity-50')
  })

  it('under forced colours those children are whole again, and the grey leaves the row the keyboard is on', async () => {
    expect(await flat).toContain(':is(.forced-colors\\:data-disabled\\:\\*\\:opacity-100[data-disabled] > *) { opacity: 100%; }')
    expect(await flat).toContain('[data-disabled]:not([data-highlighted]) { color: GrayText; }')
  })

  it('the shortcut takes the colour of its row once the row with the group class is highlighted', async () => {
    expect(await flat).toContain('.group-data-highlighted\\:text-inherit:is(:where(.group)[data-highlighted] *) { color: inherit; }')
  })
})

// Two utilities that set one property have the same specificity, so the emitted order decides (CLOUD-PLAN 11.7).
describe('the order the cascade needs', () => {
  it('the highlight of a danger row is emitted after its colour at rest', async () => {
    expect(await before('text-danger-on-soft', 'data-highlighted:text-danger-on-soft')).toBe(true)
  })

  it('the forced-colours pair is emitted after the danger highlight, so a highlighted danger row is repainted like any other', async () => {
    expect(await before('data-highlighted:bg-danger-soft', 'forced-colors:data-highlighted:bg-[Highlight]')).toBe(true)
    expect(await before('data-highlighted:text-danger-on-soft', 'forced-colors:data-highlighted:text-[HighlightText]')).toBe(true)
  })

  it('the shortcut colour of a highlighted row is emitted after its muted colour at rest', async () => {
    expect(await before('text-muted', 'group-data-highlighted:text-inherit')).toBe(true)
  })

  it('the whole opacity of forced colours is emitted after the dimmed one', async () => {
    expect(await before('data-disabled:*:opacity-50', 'forced-colors:data-disabled:*:opacity-100')).toBe(true)
  })

  it('the floor of a finger is emitted after the row height, and the grey of the system after the danger colour', async () => {
    expect(await before('min-h-(--tc-row-height)', 'pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]')).toBe(true)
    expect(await before('text-danger-on-soft', 'forced-colors:data-disabled:not-data-highlighted:text-[GrayText]')).toBe(true)
  })

  it('the scan answers false for a class with no rule, and for the two in the other order', async () => {
    expect(await before('text-muted', 'no-such-class-here')).toBe(false)
    expect(await before('group-data-highlighted:text-inherit', 'text-muted')).toBe(false)
  })
})

describe('the tokens the menu reads are the ones the plan names', () => {
  it('--tc-z-popup is 60, above a dialog at 50 and below a toast at 70', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-z-dialog: 50;')
    expect(sheet).toContain('--tc-z-popup: 60;')
    expect(sheet).toContain('--tc-z-toast: 70;')
  })

  it('a row is 2.5rem times the density, 40 px, and the menu shows seven of them', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-row-height: calc(2.5rem * var(--tc-density));')
    expect(sheet).toContain('--tc-list-rows: 7;')
  })

  it('the spacing step is 4 px, so the menu is 192 px at least and 320 px at most, and a shortcut 160 px', async () => {
    expect(await css).toContain('--spacing: 0.25rem;')
  })

  it('a finger needs 44 px, and --tc-duration is 150 ms times --tc-motion, which reduced motion sets to 0', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-target-coarse: 44px;')
    expect(sheet).toContain('--tc-duration-base: calc(150ms * var(--tc-motion));')
    expect(await flat).toContain('@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0; } }')
  })
})
