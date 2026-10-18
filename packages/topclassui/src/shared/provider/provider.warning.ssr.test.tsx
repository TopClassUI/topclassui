import type { ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useLocale } from './context.js'
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

  it('never warns about a missing provider during a server render either', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Locale = () => <p>{useLocale()}</p>
    expect(renderToString(<Locale />)).toBe('<p>en</p>')
    expect(warn).not.toHaveBeenCalled()
  })
})
