import { describe, expect, it } from 'vitest'

import { ACTIONS_WRAP, POPUP_PASSIVE, VIEWPORT_PASSIVE } from '#shared/classes.js'
import { compileEntry } from '#test/stylesheet.js'
import { DIALOG_BODY_SHORT } from '../classes.js'

const COARSE = 'min-height: var(--tc-target-coarse,44px);'

/** The classes that act on a child of the footer, on a short screen or in a dialog that is not modal. */
const DECLARATION: Record<string, string> = {
  'pointer-events-none': 'pointer-events: none;',
  'pointer-events-auto': 'pointer-events: auto;',
  '[@media(height<17rem)]:shrink-0': 'flex-shrink: 0;',
  '[@media(height<17rem)]:overflow-y-visible': 'overflow-y: visible;',
  '**:whitespace-normal': 'white-space: normal;',
  '*:data-size:text-center': 'text-align: center;',
  '*:data-size:not-data-[size=custom]:h-auto': 'height: auto;',
  '*:data-size:not-data-[size=custom]:py-1': 'padding-block: var(--spacing);',
  '*:data-[size=xs]:min-h-control-xs': 'min-height: calc(1.75rem * var(--tc-density));',
  '*:data-[size=sm]:min-h-control-sm': 'min-height: calc(2rem * var(--tc-density));',
  '*:data-[size=md]:min-h-control-md': 'min-height: calc(2.5rem * var(--tc-density));',
  '*:data-[size=lg]:min-h-control-lg': 'min-height: calc(3rem * var(--tc-density));',
  '*:data-[size=xl]:min-h-control-xl': 'min-height: calc(3.5rem * var(--tc-density));',
  'pointer-coarse:*:data-[size=xs]:min-h-[var(--tc-target-coarse,44px)]': COARSE,
  'pointer-coarse:*:data-[size=sm]:min-h-[var(--tc-target-coarse,44px)]': COARSE,
  'pointer-coarse:*:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]': COARSE,
}

/** What each selector must end in: the child it reaches, written out as Tailwind writes it. */
const REACHES: Record<string, string> = {
  '**:whitespace-normal': ' *) {',
  '*:data-size:text-center': ' > *)[data-size] {',
  '*:data-size:not-data-[size=custom]:h-auto': ' > *)[data-size]:not([data-size="custom"]) {',
  '*:data-size:not-data-[size=custom]:py-1': ' > *)[data-size]:not([data-size="custom"]) {',
  '*:data-[size=xs]:min-h-control-xs': ' > *)[data-size="xs"] {',
  '*:data-[size=md]:min-h-control-md': ' > *)[data-size="md"] {',
  '*:data-[size=xl]:min-h-control-xl': ' > *)[data-size="xl"] {',
  'pointer-coarse:*:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]': ' > *)[data-size="md"] {',
}

/** The classes of Button that the footer has to beat or leave standing, compiled beside its own. */
const OF_BUTTON = [
  'truncate', 'whitespace-nowrap', 'h-control-md', 'min-h-[var(--tc-target-min,24px)]',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'flex-1', 'overflow-y-auto',
]

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** Where the selector of a class starts in the sheet, which is the order the cascade reads it in. */
const at = (css: string, cls: string) => css.indexOf(`.${escape(cls)}`)

/** The rule of one class: from its selector to the first closing brace. */
function ruleFor(css: string, cls: string): string {
  const from = at(css, cls)
  return from === -1 ? '' : css.slice(from, css.indexOf('}', from) + 1)
}

const written = (strings: readonly string[]) => [...new Set(strings.join(' ').split(' '))].sort()

describe('the classes of the footer actions, the short screen and the dialog that is not modal compile', () => {
  const css = compileEntry().then((compiled) => compiled.build([...Object.keys(DECLARATION), ...OF_BUTTON]))

  it('the table names exactly the classes of the four strings', () => {
    const all = written([ACTIONS_WRAP, DIALOG_BODY_SHORT, VIEWPORT_PASSIVE, POPUP_PASSIVE])
    expect(all).toEqual(Object.keys(DECLARATION).sort())
    expect(all).toHaveLength(16)
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }

  for (const [cls, reach] of Object.entries(REACHES)) {
    it(`${cls} reaches ${reach.slice(0, -2).trim()}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(reach)
    })
  }

  it('the two short-screen classes sit inside the query for a screen under 17rem tall', async () => {
    const sheet = await css
    for (const cls of ['[@media(height<17rem)]:shrink-0', '[@media(height<17rem)]:overflow-y-visible']) {
      // '@media (', with its space: the class name itself holds an escaped @media.
      const before = sheet.slice(sheet.lastIndexOf('@media (', at(sheet, cls)), at(sheet, cls)).replace(/\s+/g, ' ')
      expect(before.slice(0, 24), cls).toBe('@media (height<17rem) { ')
      expect(before.split('{').length - before.split('}').length, cls).toBe(1)
    }
  })

  it('the three coarse floors sit inside the coarse-pointer query, so a mouse keeps the height of the size', async () => {
    const sheet = await css
    const cls = 'pointer-coarse:*:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]'
    const before = sheet.slice(sheet.lastIndexOf('@media (', at(sheet, cls)), at(sheet, cls)).replace(/\s+/g, ' ')
    expect(before.slice(0, 27)).toBe('@media (pointer: coarse) { ')
    expect(before.split('{').length - before.split('}').length).toBe(1)
  })
})

// Two rules of equal weight on one element: the later one in the sheet is the one the browser takes.
describe('the order the cascade needs', () => {
  const css = compileEntry().then((compiled) => compiled.build([...Object.keys(DECLARATION), ...OF_BUTTON]))
  const follows = async (later: string, earlier: string) => {
    const sheet = await css
    expect(at(sheet, earlier), earlier).toBeGreaterThan(-1)
    expect(at(sheet, later), `${later} must come after ${earlier}`).toBeGreaterThan(at(sheet, earlier))
  }

  it('the footer lifts nowrap after Button sets it, on the button and on its truncating label', async () => {
    await follows('**:whitespace-normal', 'whitespace-nowrap')
    await follows('**:whitespace-normal', 'truncate')
  })

  it('under a finger the 44 px floor comes after the height of the size, and so wins it', async () => {
    await follows('pointer-coarse:*:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]', '*:data-[size=md]:min-h-control-md')
    await follows('pointer-coarse:*:data-[size=xs]:min-h-[var(--tc-target-coarse,44px)]', '*:data-[size=xs]:min-h-control-xs')
    await follows('pointer-coarse:*:data-[size=sm]:min-h-[var(--tc-target-coarse,44px)]', '*:data-[size=sm]:min-h-control-sm')
  })

  it('on a short screen the body stops shrinking and stops scrolling after flex-1 and overflow-y-auto said otherwise', async () => {
    await follows('[@media(height<17rem)]:shrink-0', 'flex-1')
    await follows('[@media(height<17rem)]:overflow-y-visible', 'overflow-y-auto')
  })

  it('the height a footer gives an action outweighs Button own, whatever the order: two conditions against one class', async () => {
    const sheet = await css
    expect(ruleFor(sheet, 'h-control-md')).toBe('.h-control-md {\n    height: calc(2.5rem * var(--tc-density));\n  }')
    expect(ruleFor(sheet, '*:data-size:not-data-[size=custom]:h-auto')).toContain('[data-size]:not([data-size="custom"])')
  })
})
