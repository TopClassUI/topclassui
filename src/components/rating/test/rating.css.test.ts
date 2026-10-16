import { describe, expect, it } from 'vitest'

import { FOCUS_RING_WITHIN, TOUCH_TARGET } from '#shared/classes.js'
import { compileEntry } from '#test/stylesheet.js'
import {
  RATING_FILL, RATING_FILL_ICON, RATING_FILL_WIDTH, RATING_RADIO, RATING_ROOT, RATING_STAR, RATING_STEP,
} from '../classes.js'

// Rating's own classes; the shared ones (TOUCH_TARGET, FOCUS_RING_WITHIN, DISABLED) are pinned in src/shared.
const DECLARATION: Record<string, string> = {
  'inline-flex': 'display: inline-flex;',
  'flex-wrap': 'flex-wrap: wrap;',
  'items-center': 'align-items: center;',
  'gap-1': 'gap: var(--spacing);',
  'max-w-full': 'max-width: 100%;',
  relative: 'position: relative;',
  'shrink-0': 'flex-shrink: 0;',
  'text-line-strong': 'color: var(--tc-line-strong);',
  absolute: 'position: absolute;',
  'inset-y-0': 'inset-block: 0px;',
  'inset-s-0': 'inset-inline-start: 0px;',
  flex: 'display: flex;',
  'overflow-hidden': 'overflow: hidden;',
  'text-warning-on-soft': 'color: var(--tc-warning-on-soft);',
  'w-full': 'width: 100%;',
  'w-1/2': 'width: calc(1 / 2 * 100%);',
  'max-w-none': 'max-width: none;',
  'cursor-pointer': 'cursor: pointer;',
  'justify-center': 'justify-content: center;',
  'rounded-control': 'border-radius: var(--tc-radius);',
  'inset-0': 'inset: 0px;',
  'size-full': 'width: 100%;',
  'appearance-none': 'appearance: none;',
  'opacity-0': 'opacity: 0%;',
}

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The rule Tailwind emits for one class: its selector up to the closing brace. */
function ruleFor(css: string, cls: string): string {
  const at = css.indexOf(`.${escape(cls)} {`)
  return at === -1 ? '' : css.slice(at, css.indexOf('}', at) + 1)
}

/** Every class of Rating's own tables, without the two shared constants a step is built from. */
const shared = new Set(`${TOUCH_TARGET} ${FOCUS_RING_WITHIN}`.split(' '))
const written = [RATING_ROOT, RATING_STAR, RATING_FILL, RATING_FILL_ICON, RATING_RADIO, RATING_STEP, ...Object.values(RATING_FILL_WIDTH)]
  .join(' ').split(' ').filter((cls) => !shared.has(cls))

describe('every class Rating writes compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of the row, the star, the clip, the step and the radio', () => {
    expect([...new Set(written)].sort()).toEqual(Object.keys(DECLARATION).sort())
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }
})

describe('the guarantees a class carries', () => {
  it('the half clip starts at the inline start, never a physical side', () => {
    expect(RATING_FILL.split(' ')).toContain('inset-s-0')
    expect(RATING_FILL).not.toMatch(/\b(left|right)-/)
  })

  it('the colour of a star sits on its span: the svg inside carries none', () => {
    expect(RATING_FILL_ICON).toBe('max-w-none')
    expect(RATING_STAR.split(' ')).toContain('text-line-strong')
    expect(RATING_FILL.split(' ')).toContain('text-warning-on-soft')
  })

  it('a filled star is warning-on-soft, which check-contrast holds above 3:1 on every surface; warning-solid is 2.13:1', () => {
    expect(RATING_FILL.split(' ').filter((cls) => cls.startsWith('text-'))).toEqual(['text-warning-on-soft'])
  })

  it('the radio covers its whole label and is invisible, never sr-only', () => {
    expect(RATING_RADIO.split(' ')).toEqual(['absolute', 'inset-0', 'size-full', 'cursor-pointer', 'appearance-none', 'opacity-0'])
  })

  it('a step is a target and carries the ring of the radio it holds', () => {
    expect(RATING_STEP).toContain('min-h-[var(--tc-target-min,24px)] min-w-[var(--tc-target-min,24px)]')
    expect(RATING_STEP).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
    expect(RATING_STEP).toContain('has-focus-visible:outline-solid')
  })

  it('the row wraps and never grows past its box', () => {
    expect(RATING_ROOT.split(' ')).toEqual(['inline-flex', 'flex-wrap', 'items-center', 'gap-1', 'max-w-full'])
  })
})
