import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { ACTIONS_WRAP } from './classes.js'

const COARSE = 'pointer-coarse:*:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]'

/** Every class of the constant, in the order it is written, with the declaration Tailwind emits for it. */
const DECLARATION: [string, string][] = [
  ['**:whitespace-normal', 'white-space: normal;'],
  ['*:data-size:text-center', 'text-align: center;'],
  ['*:data-size:not-data-[size=custom]:h-auto', 'height: auto;'],
  ['*:data-size:not-data-[size=custom]:py-1', 'padding-block: var(--spacing);'],
  ['*:data-[size=xs]:min-h-control-xs', 'min-height: calc(1.75rem * var(--tc-density));'],
  ['*:data-[size=sm]:min-h-control-sm', 'min-height: calc(2rem * var(--tc-density));'],
  ['*:data-[size=md]:min-h-control-md', 'min-height: calc(2.5rem * var(--tc-density));'],
  ['*:data-[size=lg]:min-h-control-lg', 'min-height: calc(3rem * var(--tc-density));'],
  ['*:data-[size=xl]:min-h-control-xl', 'min-height: calc(3.5rem * var(--tc-density));'],
  ['pointer-coarse:*:data-[size=xs]:min-h-[var(--tc-target-coarse,44px)]', 'min-height: var(--tc-target-coarse,44px);'],
  ['pointer-coarse:*:data-[size=sm]:min-h-[var(--tc-target-coarse,44px)]', 'min-height: var(--tc-target-coarse,44px);'],
  [COARSE, 'min-height: var(--tc-target-coarse,44px);'],
]

/** What Button sets on itself and on its label, compiled beside the wrap so the order can be read. */
const OF_BUTTON = ['truncate', 'whitespace-nowrap', 'h-control-md', 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]']

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** Where the selector of a class starts in the sheet, which is the order the cascade reads it in. */
const at = (css: string, cls: string) => css.indexOf(`.${escape(cls)}`)

/** The rule of one class: from its selector to the first closing brace. */
function ruleFor(css: string, cls: string): string {
  const from = at(css, cls)
  return from === -1 ? '' : css.slice(from, css.indexOf('}', from) + 1)
}

describe('ACTIONS_WRAP, on the bar that holds the actions of an overlay', () => {
  it('is exactly these twelve classes, in this order', () => {
    expect(ACTIONS_WRAP.split(' ')).toEqual([
      '**:whitespace-normal', '*:data-size:text-center',
      '*:data-size:not-data-[size=custom]:h-auto', '*:data-size:not-data-[size=custom]:py-1',
      '*:data-[size=xs]:min-h-control-xs', '*:data-[size=sm]:min-h-control-sm', '*:data-[size=md]:min-h-control-md',
      '*:data-[size=lg]:min-h-control-lg', '*:data-[size=xl]:min-h-control-xl',
      'pointer-coarse:*:data-[size=xs]:min-h-[var(--tc-target-coarse,44px)]',
      'pointer-coarse:*:data-[size=sm]:min-h-[var(--tc-target-coarse,44px)]',
      'pointer-coarse:*:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]',
    ])
  })

  it('styles the bar itself with nothing: every class reaches a child or a descendant', () => {
    expect(ACTIONS_WRAP.split(' ').filter((cls) => !cls.includes('*:'))).toEqual([])
  })

  it('gives a floor to each of the five sizes and none to custom, which keeps the height its caller gave it', () => {
    const floors = ACTIONS_WRAP.split(' ').filter((cls) => cls.startsWith('*:data-[size=')).map((cls) => cls.slice(13, 15))
    expect(floors).toEqual(['xs', 'sm', 'md', 'lg', 'xl'])
    expect(ACTIONS_WRAP).not.toContain('data-[size=custom]:min-h')
  })

  // lg and xl are 48 and 56 px already, so only the three sizes under 44 px need the floor of a finger.
  it('lifts only the three sizes under 44 px to the floor of a finger', () => {
    const coarse = ACTIONS_WRAP.split(' ').filter((cls) => cls.startsWith('pointer-coarse:')).map((cls) => cls.slice(28, 30))
    expect(coarse).toEqual(['xs', 'sm', 'md'])
  })
})

describe('every class of ACTIONS_WRAP compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build([...DECLARATION.map(([cls]) => cls), ...OF_BUTTON]))

  it('the table is the constant, class for class', () => {
    expect(ACTIONS_WRAP.split(' ')).toEqual(DECLARATION.map(([cls]) => cls))
  })

  for (const [cls, declaration] of DECLARATION) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }

  it('whitespace-normal reaches every descendant, so the label inside a Button wraps as well as the Button', async () => {
    expect(ruleFor(await css, '**:whitespace-normal')).toContain(' *) {')
  })

  it('the height and the floors reach direct children only, and only those that carry a size', async () => {
    const sheet = await css
    expect(ruleFor(sheet, '*:data-size:text-center')).toContain(' > *)[data-size] {')
    expect(ruleFor(sheet, '*:data-size:not-data-[size=custom]:h-auto')).toContain(' > *)[data-size]:not([data-size="custom"]) {')
    expect(ruleFor(sheet, '*:data-size:not-data-[size=custom]:py-1')).toContain(' > *)[data-size]:not([data-size="custom"]) {')
    expect(ruleFor(sheet, '*:data-[size=md]:min-h-control-md')).toContain(' > *)[data-size="md"] {')
    expect(ruleFor(sheet, COARSE)).toContain(' > *)[data-size="md"] {')
  })

  it('the coarse floors sit inside the coarse-pointer query, so a mouse keeps the height of the size', async () => {
    const sheet = await css
    // '@media (', with its space: no class name here holds one, but a later constant may.
    const before = sheet.slice(sheet.lastIndexOf('@media (', at(sheet, COARSE)), at(sheet, COARSE)).replace(/\s+/g, ' ')
    expect(before.slice(0, 27)).toBe('@media (pointer: coarse) { ')
    expect(before.split('{').length - before.split('}').length).toBe(1)
  })
})

// Two rules of equal weight on one element: the later one in the sheet is the one the browser takes.
describe('the order the cascade needs of ACTIONS_WRAP', () => {
  const css = compileEntry().then((compiled) => compiled.build([...DECLARATION.map(([cls]) => cls), ...OF_BUTTON]))
  const follows = async (later: string, earlier: string) => {
    const sheet = await css
    expect(at(sheet, earlier), earlier).toBeGreaterThan(-1)
    expect(at(sheet, later), `${later} must come after ${earlier}`).toBeGreaterThan(at(sheet, earlier))
  }

  it('nowrap is lifted after Button sets it, on the button and on its truncating label', async () => {
    await follows('**:whitespace-normal', 'whitespace-nowrap')
    await follows('**:whitespace-normal', 'truncate')
  })

  it('under a finger the 44 px floor comes after the floor of the size, and so wins it', async () => {
    await follows('pointer-coarse:*:data-[size=xs]:min-h-[var(--tc-target-coarse,44px)]', '*:data-[size=xs]:min-h-control-xs')
    await follows('pointer-coarse:*:data-[size=sm]:min-h-[var(--tc-target-coarse,44px)]', '*:data-[size=sm]:min-h-control-sm')
    await follows(COARSE, '*:data-[size=md]:min-h-control-md')
  })

  it('height auto outweighs the height Button gives itself, whatever the order: two conditions against one class', async () => {
    const sheet = await css
    expect(ruleFor(sheet, 'h-control-md')).toBe('.h-control-md {\n    height: calc(2.5rem * var(--tc-density));\n  }')
    expect(ruleFor(sheet, '*:data-size:not-data-[size=custom]:h-auto')).toContain('[data-size]:not([data-size="custom"])')
  })
})
