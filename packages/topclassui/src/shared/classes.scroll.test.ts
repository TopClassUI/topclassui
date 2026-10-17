import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { FOCUS_RING, SCROLL_AREA } from './classes.js'

/** The padding, written out: the two knobs the focus ring is drawn with, added up. */
const RING_ROOM = 'scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]'

/** The rule Tailwind emits for one class: its selector up to the closing brace. */
function ruleFor(css: string, cls: string): string {
  const at = css.indexOf(`.${cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')}`)
  return at === -1 ? '' : css.slice(at, css.indexOf('}', at) + 1)
}

describe('the scroll area of an overlay (R-10.5-1)', () => {
  it('is exactly five classes: it scrolls on the block axis, keeps the scroll to itself, leaves room for a ring and wears the shared scrollbar', () => {
    expect(SCROLL_AREA.split(' ')).toEqual(['overflow-y-auto', 'overscroll-contain', RING_ROOM, '[scrollbar-width:thin]', '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]'])
  })

  it('names no physical side, so the room is the same in both directions', () => {
    expect(SCROLL_AREA).not.toMatch(/scroll-p[tblr]-/)
  })
})

// Tab scrolls a control only just into view, flush with the edge, and the ring is drawn outside the control.
describe('the room is the reach of the focus ring, read from the same two knobs', () => {
  const tokens = readFileSync(join(process.cwd(), 'src', 'tokens.css'), 'utf8')

  it('the ring is drawn with --tc-ring-width at --tc-ring-offset from the control', () => {
    expect(FOCUS_RING.split(' ')).toContain('focus-visible:outline-(length:--tc-ring-width)')
    expect(FOCUS_RING.split(' ')).toContain('focus-visible:outline-offset-(length:--tc-ring-offset)')
  })

  it('which is 2 px and 2 px by default, so the area keeps 4 px clear', () => {
    expect(tokens).toContain('--tc-ring-width: 2px;')
    expect(tokens).toContain('--tc-ring-offset: 2px;')
  })
})

describe('every class of the scroll area compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(['overflow-y-auto', 'overscroll-contain', RING_ROOM]))

  it('overflow-y-auto scrolls the block axis', async () => {
    expect(ruleFor(await css, 'overflow-y-auto')).toContain('overflow-y: auto;')
  })

  it('overscroll-contain stops the scroll at the edge of the area', async () => {
    expect(ruleFor(await css, 'overscroll-contain')).toContain('overscroll-behavior: contain;')
  })

  it('the room is scroll padding on the block axis, the sum of the two ring knobs', async () => {
    expect(ruleFor(await css, RING_ROOM)).toContain('scroll-padding-block: calc(var(--tc-ring-width) + var(--tc-ring-offset));')
  })
})
