import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from './provider.js'

describe('the one toast viewport', () => {
  const regions = () => document.querySelectorAll('[role="region"][aria-live]')

  it('is mounted by the provider itself, after the app, in a portal outside the isolation root', async () => {
    const view = render(<TopClassProvider direction="ltr" locale="en"><p>App</p></TopClassProvider>)
    await screen.findByRole('region', { name: 'Notifications' })
    expect(regions()).toHaveLength(1)
    expect(view.container.contains(regions()[0] ?? null)).toBe(false)
    expect(view.container.innerHTML).toBe('<div class="isolate"><p>App</p></div>')
  })

  it('is mounted once: a nested provider, such as an RTL island, mounts none of its own', async () => {
    render(
      <TopClassProvider direction="ltr" locale="en">
        <TopClassProvider direction="rtl" locale="ar"><p>Island</p></TopClassProvider>
      </TopClassProvider>,
    )
    const region = await screen.findByRole('region', { name: 'Notifications' })
    expect(regions()).toHaveLength(1)
    expect([region.getAttribute('dir'), region.getAttribute('lang')]).toEqual(['ltr', 'en'])
  })

  it('is drawn once on a page of two React roots that each mount a provider, and passes to the second when the first unmounts', async () => {
    const first = render(<TopClassProvider direction="ltr" locale="en" />)
    render(<TopClassProvider direction="rtl" locale="ar" />)
    await screen.findByRole('region', { name: 'Notifications' })
    expect(regions()).toHaveLength(1)
    first.unmount()
    expect(await screen.findByRole('region', { name: 'الإشعارات' })).toBeTruthy()
    expect(regions()).toHaveLength(1)
  })

  it('takes its placement from the outer provider, never from an island', async () => {
    render(
      <TopClassProvider direction="ltr" locale="en" toast={{ placement: 'top-start' }}>
        <TopClassProvider direction="rtl" locale="ar" toast={{ placement: 'bottom' }}><p>Island</p></TopClassProvider>
      </TopClassProvider>,
    )
    const region = await screen.findByRole('region', { name: 'Notifications' })
    expect(region.className.split(' ')).toEqual(expect.arrayContaining(['top-0', 'inset-s-0']))
    expect(region.className.split(' ')).not.toContain('bottom-0')
  })

  it('renders no toast markup on the server: the portal waits for the browser', () => {
    expect(renderToString(<TopClassProvider direction="ltr" locale="en"><p>App</p></TopClassProvider>))
      .toBe('<div class="isolate"><p>App</p></div>')
  })
})
