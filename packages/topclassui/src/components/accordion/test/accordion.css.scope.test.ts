import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'

// accordion.css.test.ts proves what each class declares; this proves where: a state class that painted at rest would pass that one.

/** The selector each variant class must be scoped to, or it would paint at rest. */
const SCOPE: Record<string, string> = {
  'first:border-t-0': ':first-child {',
  'hover:bg-(--tc-soft)': ':hover:not(:where(:disabled, [aria-disabled="true"], [data-disabled])) {',
  'active:bg-(--tc-soft-hover)': ':active:not(:where(:disabled, [aria-disabled="true"], [data-disabled])) {',
  'focus-visible:outline-solid': ':focus-visible {',
  'focus-visible:-outline-offset-(length:--tc-ring-width)': ':focus-visible {',
  'data-disabled:opacity-50': '[data-disabled] {',
  // Inside a disabled root the box has dimmed already, so the trigger does not dim a second time.
  'not-forced-colors:not-group-data-disabled/accordion:data-disabled:opacity-50': ':not(:is(:where(.group/accordion)[data-disabled] *))[data-disabled] {',
  'not-forced-colors:not-group-data-disabled/accordion:disabled:opacity-50': ':not(:is(:where(.group/accordion)[data-disabled] *)):disabled {',
  'forced-colors:data-disabled:text-[GrayText]': '[data-disabled] {',
  'forced-colors:data-disabled:opacity-100': '[data-disabled] {',
  'forced-colors:group-data-disabled:text-[GrayText]': ':is(:where(.group)[data-disabled] *) {',
  // The last trigger is rounded only while its panel is closed: open, it is no longer at the bottom edge.
  '[:last-child>*>&]:not-data-panel-open:rounded-b-box': ':not([data-panel-open]) {',
  // The group is the trigger, the only element Base UI gives data-panel-open.
  'group-data-panel-open:rotate-180': ':is(:where(.group)[data-panel-open] *) {',
  'data-starting-style:opacity-0': '[data-starting-style] {',
  'data-ending-style:opacity-0': '[data-ending-style] {',
}

/** What stands in front of the class in its selector: an item that is the first or the last child of
 * the box, then any element, then the class. Item, heading, trigger; and item, panel, region. */
const FRONT: Record<string, string> = {
  '[:first-child>*>&]:rounded-t-box': ':first-child > * >',
  '[:last-child>*>&]:not-data-panel-open:rounded-b-box': ':last-child > * >',
  '[:last-child>*>&]:rounded-b-box': ':last-child > * >',
}

/** The classes Tailwind wraps from outside: the query opens just before the selector. */
const WRAPPED: Record<string, string> = {
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': '@media (pointer: coarse) { ',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]': '@media (pointer: coarse) { ',
  'forced-colors:data-disabled:text-[GrayText]': '@media (forced-colors: active) { ',
  'forced-colors:data-disabled:opacity-100': '@media (forced-colors: active) { ',
  'forced-colors:group-data-disabled:text-[GrayText]': '@media (forced-colors: active) { ',
}

const CLASSES = [...new Set([...Object.keys(SCOPE), ...Object.keys(FRONT), ...Object.keys(WRAPPED), 'duration-(--tc-duration)'])]

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The text between the last brace before a class and the class itself: the front of its selector. */
function frontOf(css: string, cls: string): string {
  const at = css.indexOf(`.${escape(cls)}`)
  return at === -1 ? '(no rule)' : css.slice(Math.max(css.lastIndexOf('{', at), css.lastIndexOf('}', at)) + 1, at).trim()
}

/** The rule Tailwind emits for one class: from its selector to the brace that closes its outermost block. */
function ruleFor(css: string, cls: string): string {
  const at = css.indexOf(`.${escape(cls)}`)
  if (at === -1) return ''
  let depth = 0
  for (let index = css.indexOf('{', at); index < css.length; index++) {
    if (css[index] === '{') depth += 1
    else if (css[index] === '}' && --depth === 0) return css.slice(at, index + 1)
  }
  return ''
}

describe('every variant class of an Accordion applies where it should and nowhere else', () => {
  const css = compileEntry().then((compiled) => compiled.build(CLASSES))

  for (const [cls, scope] of Object.entries(SCOPE)) {
    it(`${cls} applies only under ${scope}`, async () => {
      expect(ruleFor(await css, cls).replace(/\\/g, ''), cls).toContain(scope)
    })
  }

  for (const [cls, front] of Object.entries(FRONT)) {
    it(`${cls} reaches only what sits under ${front}`, async () => {
      expect(frontOf(await css, cls), cls).toBe(front)
    })
  }

  for (const [cls, query] of Object.entries(WRAPPED)) {
    it(`${cls} sits inside ${query.trim()}`, async () => {
      const sheet = await css
      const at = sheet.indexOf(`.${escape(cls)}`)
      const before = sheet.slice(sheet.lastIndexOf('@', at), at).replace(/\s+/g, ' ')
      expect(before.slice(0, query.length)).toBe(query)
      // Still inside that block: one more brace opened than closed between the query and the selector.
      expect(before.split('{').length - before.split('}').length).toBe(1)
    })
  }

  it('each corner rule rounds both corners of its side', async () => {
    const sheet = await css
    const radius = 'radius: min(calc(var(--tc-radius) * 1.5), 1.5rem);'
    const first = ruleFor(sheet, '[:first-child>*>&]:rounded-t-box')
    expect(first).toContain(`border-top-left-${radius}`)
    expect(first).toContain(`border-top-right-${radius}`)
    for (const cls of ['[:last-child>*>&]:rounded-b-box', '[:last-child>*>&]:not-data-panel-open:rounded-b-box']) {
      expect(ruleFor(sheet, cls), cls).toContain(`border-bottom-left-${radius}`)
      expect(ruleFor(sheet, cls), cls).toContain(`border-bottom-right-${radius}`)
    }
  })

  it('the front of a selector is read up to the class, and a class with no rule says so', async () => {
    expect(frontOf('.a { top: 0 } .b>*>.c { top: 0 }', 'c')).toBe('.b>*>')
    expect(frontOf(await css, 'no-such-class-here')).toBe('(no rule)')
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
  })
})

describe('the tokens the classes read', () => {
  const css = compileEntry().then((compiled) => compiled.build(CLASSES))

  it('--tc-duration is 150 ms times --tc-motion, which reduced motion sets to 0: the fade and the turn stop together', async () => {
    const sheet = await css
    expect(sheet).toContain('--tc-duration-base: calc(150ms * var(--tc-motion));')
    expect(sheet).toContain('--tc-duration: var(--tc-duration-base);')
    expect(sheet.replace(/\s+/g, ' ')).toContain('@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0; } }')
  })

  it('the ring is 2 px wide, so the inset ring lies wholly inside a trigger', async () => {
    expect(await css).toContain('--tc-ring-width: 2px;')
  })
})
