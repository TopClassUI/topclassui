import { describe, expect, it } from 'vitest'

import { familyOf, scaleEndsOf } from './utility-row'

describe('scaleEndsOf', () => {
  it('names a full xs to xl scale by its two ends', () => {
    expect(scaleEndsOf(['h-control-xs', 'h-control-sm', 'h-control-md', 'h-control-lg', 'h-control-xl'])).toEqual(['h-control-xs', 'h-control-xl'])
  })
  it('leaves anything else as a list', () => {
    expect(scaleEndsOf(['bg-page', 'bg-surface'])).toBeNull()
    expect(scaleEndsOf(['size-toggle-xs', 'size-toggle-sm', 'size-toggle-lg', 'size-toggle-md', 'size-toggle-xl'])).toBeNull()
  })
})

describe('familyOf', () => {
  it('writes the first token in full and the rest short', () => {
    expect(familyOf(['--tc-page', '--tc-surface', '--tc-surface-raised'])).toBe('--tc-page, surface, surface-raised')
    expect(familyOf(['--tc-radius', '--radius-box', '--radius-chip'])).toBe('--tc-radius, radius-box, radius-chip')
    expect(familyOf(['--tc-ring'])).toBe('--tc-ring')
  })
})
