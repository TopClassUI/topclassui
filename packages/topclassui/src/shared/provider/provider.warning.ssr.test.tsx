import type { ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopClassProvider, type TopClassProviderProps } from './provider.js'

type Loose = ComponentType<Omit<TopClassProviderProps, 'direction' | 'locale'>>
const Provider = TopClassProvider as unknown as Loose

afterEach(() => { vi.restoreAllMocks() })

describe('R-13-1: the missing-props warning on the server', () => {
  it('never warns during a server render, which has no effects', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = renderToString(<Provider><p>x</p></Provider>)
    expect(html).toContain('<p>x</p>')
    expect(warn).not.toHaveBeenCalled()
  })
})
