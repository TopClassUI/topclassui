import { describe, expect, it } from 'vitest'

import { familyOf, groupedRows, scaleEndsOf } from './utility-row'

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
    expect(familyOf(['--tc-primary-solid', '--tc-primary-on-solid', '--tc-primary-soft'])).toBe('--tc-primary-solid, on-solid, soft')
    expect(familyOf(['--tc-{tone}-solid', '--tc-{tone}-soft'])).toBe('--tc-{tone}-solid, soft')
  })
})

describe('groupedRows', () => {
  const rows = [
    { tokens: ['--tc-ring'], utilities: ['outline-ring'] },
    { tokens: ['--spacing-control-xs', '--spacing-control-sm', '--spacing-control-md', '--spacing-control-lg', '--spacing-control-xl'], utilities: ['h-control-xs', 'h-control-sm', 'h-control-md', 'h-control-lg', 'h-control-xl'] },
    { tokens: ['--tc-neutral-solid', '--tc-neutral-soft'], utilities: ['bg-neutral-solid', 'bg-neutral-soft'] },
    { tokens: ['--tc-info-solid', '--tc-info-soft'], utilities: ['bg-info-solid', 'bg-info-soft'] },
    { tokens: ['--spacing-knob-xs', '--spacing-knob-sm', '--spacing-knob-md', '--spacing-knob-lg', '--spacing-knob-xl'], utilities: ['size-knob-xs', 'size-knob-sm', 'size-knob-md', 'size-knob-lg', 'size-knob-xl'] },
  ]
  it('folds the tones into one {tone} row and the scales into one * row, where each family began', () => {
    expect(groupedRows(rows)).toEqual([
      { tokens: ['--tc-ring'], utilities: ['outline-ring'], tones: null, scale: false },
      { tokens: ['--spacing-control-*', '--spacing-knob-*'], utilities: ['h-control-*', 'size-knob-*'], tones: null, scale: true },
      { tokens: ['--tc-{tone}-solid', '--tc-{tone}-soft'], utilities: ['bg-{tone}-solid', 'bg-{tone}-soft'], tones: ['neutral', 'info'], scale: false },
    ])
  })
  it('shortens a spacing family after its first name', () => {
    expect(familyOf(['--spacing-control-*', '--spacing-knob-*'])).toBe('--spacing-control-*, knob-*')
  })
})
