import { describe, expect, it } from 'vitest'

import { DEFAULT_PLACEMENT, PLACEMENTS, type Placement, toSideAlign } from './floating.js'

describe('toSideAlign', () => {
  it('maps the vertical placements, which never mirror', () => {
    expect(toSideAlign('top')).toEqual({ side: 'top', align: 'center' })
    expect(toSideAlign('bottom')).toEqual({ side: 'bottom', align: 'center' })
    expect(toSideAlign('bottom-start')).toEqual({ side: 'bottom', align: 'start' })
    expect(toSideAlign('top-end')).toEqual({ side: 'top', align: 'end' })
  })

  it('maps start and end to the logical sides Base UI mirrors', () => {
    expect(toSideAlign('start')).toEqual({ side: 'inline-start', align: 'center' })
    expect(toSideAlign('end')).toEqual({ side: 'inline-end', align: 'center' })
  })

  it('maps the cross-axis alignment of a side placement', () => {
    expect(toSideAlign('start-top')).toEqual({ side: 'inline-start', align: 'start' })
    expect(toSideAlign('end-bottom')).toEqual({ side: 'inline-end', align: 'end' })
  })

  it('defaults to bottom-start when nothing is given', () => {
    expect(toSideAlign()).toEqual(toSideAlign(DEFAULT_PLACEMENT))
    expect(toSideAlign()).toEqual({ side: 'bottom', align: 'start' })
  })

  it('never returns a physical left or right', () => {
    for (const p of PLACEMENTS) {
      const { side } = toSideAlign(p)
      expect(side).not.toBe('left')
      expect(side).not.toBe('right')
    }
  })

  it('resolves every placement in the list to a usable pair', () => {
    const sides = new Set(['top', 'bottom', 'inline-start', 'inline-end'])
    const aligns = new Set(['start', 'center', 'end'])
    for (const p of PLACEMENTS) {
      const { side, align } = toSideAlign(p)
      expect(sides.has(side), `${p} -> ${side}`).toBe(true)
      expect(aligns.has(align), `${p} -> ${align}`).toBe(true)
    }
  })

  it('falls back rather than throwing on an unknown value', () => {
    expect(toSideAlign('left' as Placement)).toEqual({ side: 'bottom', align: 'center' })
  })
})
