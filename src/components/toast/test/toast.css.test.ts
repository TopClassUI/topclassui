import { describe, expect, it } from 'vitest'

import { POPUP_PASSIVE, VIEWPORT_PASSIVE } from '#shared/classes.js'
import { compileEntry } from '#test/stylesheet.js'
import {
  TOAST_ACTION, TOAST_CLOSE, TOAST_CONTENT, TOAST_DESCRIPTION, TOAST_ICON, TOAST_ICON_SVG, TOAST_ICON_TONE,
  TOAST_PLACEMENT, TOAST_ROOT, TOAST_TITLE, TOAST_VIEWPORT,
} from '../classes.js'

const ALL = [
  TOAST_VIEWPORT, ...Object.values(TOAST_PLACEMENT), TOAST_ROOT, TOAST_ICON, ...Object.values(TOAST_ICON_TONE),
  ...Object.values(TOAST_ICON_SVG), TOAST_CONTENT, TOAST_TITLE, TOAST_DESCRIPTION, TOAST_ACTION, TOAST_CLOSE,
].flatMap((list) => list.split(' ')).filter(Boolean)
const CLASSES = [...new Set(ALL)]

// The static harness never shows a toast, so none of these classes reaches Tailwind there.
const compiled = compileEntry().then((entry) => entry.build(CLASSES))

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The first rule of one class, from its selector to the brace that closes it. */
function ruleFor(css: string, cls: string): string {
  const at = css.indexOf(`.${escape(cls)}`)
  if (at === -1) return ''
  return css.slice(at, css.indexOf('}', at) + 1)
}

const words = (list: string) => list.split(' ')

describe('every class compiles', () => {
  it('Tailwind emits a rule for each class Toast names', async () => {
    const css = await compiled
    expect(CLASSES.filter((cls) => ruleFor(css, cls) === '')).toEqual([])
  })
})

describe('the safe area (PLAN 19, Phase 5: emulation reports none, so the rule is read)', () => {
  it('a bottom viewport pads its foot by the inset and --tc-safe-bottom, a top one its head by --tc-safe-top', async () => {
    const css = await compiled
    expect(ruleFor(css, 'pb-[calc(var(--tc-overlay-inset)+var(--tc-safe-bottom))]'))
      .toContain('padding-bottom: calc(var(--tc-overlay-inset) + var(--tc-safe-bottom));')
    expect(ruleFor(css, 'pt-[calc(var(--tc-overlay-inset)+var(--tc-safe-top))]'))
      .toContain('padding-top: calc(var(--tc-overlay-inset) + var(--tc-safe-top));')
  })

  it('each placement wears the form of its own block edge', () => {
    for (const placement of ['bottom-start', 'bottom', 'bottom-end'] as const) {
      expect(words(TOAST_PLACEMENT[placement])).toContain('pb-[calc(var(--tc-overlay-inset)+var(--tc-safe-bottom))]')
    }
    for (const placement of ['top-start', 'top', 'top-end'] as const) {
      expect(words(TOAST_PLACEMENT[placement])).toContain('pt-[calc(var(--tc-overlay-inset)+var(--tc-safe-top))]')
    }
  })
})

describe('the placements', () => {
  it('are written out, logical, and run the column away from the edge so the newest is nearest', () => {
    expect(TOAST_PLACEMENT).toEqual({
      'top-start': 'top-0 flex-col pt-[calc(var(--tc-overlay-inset)+var(--tc-safe-top))] inset-s-0',
      top: 'top-0 flex-col pt-[calc(var(--tc-overlay-inset)+var(--tc-safe-top))] inset-x-0 mx-auto',
      'top-end': 'top-0 flex-col pt-[calc(var(--tc-overlay-inset)+var(--tc-safe-top))] inset-e-0',
      'bottom-start': 'bottom-0 flex-col-reverse pb-[calc(var(--tc-overlay-inset)+var(--tc-safe-bottom))] inset-s-0',
      bottom: 'bottom-0 flex-col-reverse pb-[calc(var(--tc-overlay-inset)+var(--tc-safe-bottom))] inset-x-0 mx-auto',
      'bottom-end': 'bottom-0 flex-col-reverse pb-[calc(var(--tc-overlay-inset)+var(--tc-safe-bottom))] inset-e-0',
    })
  })

  it('compile to the logical properties, never left or right', async () => {
    const css = await compiled
    expect(ruleFor(css, 'inset-e-0')).toContain('inset-inline-end:')
    expect(ruleFor(css, 'inset-s-0')).toContain('inset-inline-start:')
    expect(ruleFor(css, 'flex-col-reverse')).toContain('flex-direction: column-reverse;')
  })
})

describe('presses and the swipe', () => {
  it('the viewport lets every press through, and a toast takes its own back', () => {
    expect(VIEWPORT_PASSIVE).toBe('pointer-events-none')
    expect(POPUP_PASSIVE).toBe('pointer-events-auto')
    expect(words(TOAST_VIEWPORT)).toContain('pointer-events-none')
    expect(words(TOAST_ROOT)).toContain('pointer-events-auto')
  })

  it('a toast rests on a transform, which the inline one of a held toast replaces instead of adding to', async () => {
    const follow = 'transform-[translate(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px))]'
    expect(words(TOAST_ROOT)).toContain(follow)
    expect(TOAST_ROOT).not.toMatch(/(^| )-?translate-[xy]-/)
    expect(ruleFor(await compiled, follow)).toContain('transform: translate(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px));')
  })

  it('a toast past the limit is not drawn', async () => {
    expect(words(TOAST_ROOT)).toContain('data-limited:hidden')
    const rule = ruleFor(await compiled, 'data-limited:hidden')
    expect(rule).toContain('[data-limited]')
    expect(rule).toContain('display: none;')
  })

  it('the viewport scrolls itself when its toasts are taller than the screen, and is never taller than it', () => {
    expect(words(TOAST_VIEWPORT)).toEqual(expect.arrayContaining(['max-h-dvh', 'overflow-y-auto', 'overscroll-contain']))
  })
})

describe('inside a toast', () => {
  it('the colour of the icon is on its box, and only the spinner turns', () => {
    expect(TOAST_ICON_TONE).toEqual({
      success: 'text-success-on-soft',
      danger: 'text-danger-on-soft',
      error: 'text-danger-on-soft',
      warning: 'text-warning-on-soft',
      info: 'text-info-on-soft',
      loading: 'text-muted',
    })
    expect(Object.entries(TOAST_ICON_SVG).filter(([, cls]) => cls !== '')).toEqual([['loading', 'animate-spin motion-reduce:animate-none']])
  })

  it('a long action label wraps inside its button, and a long word breaks inside the toast', () => {
    expect(words(TOAST_ACTION)).toEqual(expect.arrayContaining(['whitespace-normal', 'h-auto']))
    expect(words(TOAST_ROOT)).toContain('wrap-anywhere')
    expect(words(TOAST_DESCRIPTION)).toContain('wrap-anywhere')
  })

  it('the x is sticky beside the text, so it stays on screen while any of a toast taller than the screen shows (TOAST-3)', async () => {
    expect(words(TOAST_CLOSE)).toEqual(expect.arrayContaining(['col-start-3', 'row-start-1', 'row-span-2', 'self-start', 'sticky', 'top-0']))
    const css = await compiled
    expect(ruleFor(css, 'sticky')).toContain('position: sticky;')
    expect(ruleFor(css, 'row-span-2')).toContain('grid-row: span 2 / span 2;')
  })

  it('a toast is a grid that the viewport measures: under 16rem the icon and the action take rows of their own (TOAST-4)', async () => {
    expect(words(TOAST_VIEWPORT)).toContain('@container')
    expect(words(TOAST_ROOT)).toEqual(expect.arrayContaining(['grid', 'grid-cols-[auto_minmax(0,1fr)_auto]']))
    expect(words(TOAST_ICON)).toEqual(expect.arrayContaining(['col-start-1', 'row-start-1', 'me-3']))
    expect(words(TOAST_CONTENT)).toEqual(expect.arrayContaining(['col-start-2', 'row-start-1', '@max-3xs:col-start-1', '@max-3xs:col-span-2', '@max-3xs:row-start-2']))
    expect(words(TOAST_ACTION)).toEqual(expect.arrayContaining(['col-start-2', 'row-start-2', 'justify-self-start', '@max-3xs:col-start-1', '@max-3xs:col-span-3', '@max-3xs:row-start-3']))
    const css = await compiled
    expect(ruleFor(css, '@container')).toContain('container-type: inline-size;')
    expect(ruleFor(css, '@max-3xs:col-span-3')).toContain('grid-column: span 3 / span 3;')
    // Tailwind groups the variant's rules in one block: the class sits inside the last one opened before it.
    const at = css.indexOf(`.${escape('@max-3xs:col-span-3')}`)
    const block = css.slice(css.lastIndexOf('@container', at), at)
    expect(block.startsWith('@container (width < 16rem) {')).toBe(true)
    expect(block.split('{').length).toBeGreaterThan(block.split('}').length)
  })
})
