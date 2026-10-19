import { describe, expect, it } from 'vitest'

import { chipOf, kbOf } from './chip'

const labels = { lazy: 'lazy' }

describe('chipOf', () => {
  it('prints 0 KB for a server component', () => {
    expect(chipOf({ rendering: 'server', slug: 'button', clientBytes: null }, labels)).toBe('server - 0 KB')
  })

  it('prints the measured client bytes for a client component', () => {
    expect(chipOf({ rendering: 'client', slug: 'segmented-control', clientBytes: 4915 }, labels)).toBe('client - 4.8 KB')
  })

  it('prints both halves for a split component', () => {
    expect(chipOf({ rendering: 'split', slug: 'tag', clientBytes: 2150 }, labels)).toBe('split - 0 KB server + 2.1 KB client')
  })

  it('says lazy for Command and DatePicker', () => {
    expect(chipOf({ rendering: 'client', slug: 'command', clientBytes: 6538 }, labels)).toBe('client - 6.4 KB, lazy')
  })

  it('refuses a client component with no measurement rather than print a wrong number', () => {
    expect(() => chipOf({ rendering: 'client', slug: 'dialog', clientBytes: null }, labels)).toThrow('dialog is client but size.json has no number for it')
  })
})

describe('kbOf', () => {
  it('rounds to one decimal of 1024 bytes', () => {
    expect(kbOf(0)).toBe('0.0 KB')
    expect(kbOf(1024)).toBe('1.0 KB')
    expect(kbOf(16782)).toBe('16.4 KB')
  })
})
