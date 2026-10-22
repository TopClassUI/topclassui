import { describe, expect, it } from 'vitest'

import { definitionOf } from './class-sample'

describe('definitionOf', () => {
  it('prints a class string as a constant, split near fifty characters with the space kept on the next line', () => {
    expect(definitionOf('RING', 'outline-none focus-visible:outline-(length:--tc-ring-width) focus-visible:outline-ring')).toBe(
      "export const RING =\n  'outline-none' +\n  ' focus-visible:outline-(length:--tc-ring-width)' +\n  ' focus-visible:outline-ring'",
    )
  })

  it('keeps a short string on one line', () => {
    expect(definitionOf('A', 'min-h-6 min-w-6')).toBe("export const A =\n  'min-h-6 min-w-6'")
  })
})
