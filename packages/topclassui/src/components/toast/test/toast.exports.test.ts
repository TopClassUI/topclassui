import { describe, expect, it } from 'vitest'

import * as exported from '../index.js'

// PLAN: two public names and no more. Every other part is drawn by the viewport the provider mounts.
describe('index.tsx exports three names', () => {
  it('ToastStage, ToastViewport and toast, nothing else', () => {
    expect(Object.keys(exported).sort()).toEqual(['ToastStage', 'ToastViewport', 'toast'])
  })

  it('toast holds the four calls, each a plain function', () => {
    expect(Object.keys(exported.toast).sort()).toEqual(['add', 'close', 'promise', 'update'])
    for (const [name, value] of Object.entries(exported.toast)) expect(typeof value, name).toBe('function')
  })
})
