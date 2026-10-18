import { describe, expect, it } from 'vitest'

import { chipOf } from './chip'

const labels = { notMeasured: 'size not measured yet', lazy: 'lazy' }

describe('chipOf', () => {
  it('prints 0 KB for a server component', () => {
    expect(chipOf('server', 'button', labels)).toBe('server - 0 KB')
  })

  it('prints no number for a client or split component until pnpm size exists', () => {
    expect(chipOf('client', 'segmented-control', labels)).toBe('client - size not measured yet')
    expect(chipOf('split', 'tag', labels)).toBe('split - size not measured yet')
  })

  it('says lazy for Command and DatePicker', () => {
    expect(chipOf('client', 'command', labels)).toBe('client - size not measured yet, lazy')
  })
})
