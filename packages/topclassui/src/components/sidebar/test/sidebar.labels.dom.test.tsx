import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { SidebarHeader, SidebarRoot } from '../index.js'

const rail = <SidebarRoot><SidebarHeader>Workspace</SidebarHeader></SidebarRoot>

/** The name of the rail, of its toggle while expanded and, after one press, of its toggle while collapsed. */
async function names(tree: ReactNode) {
  const user = userEvent.setup()
  render(tree)
  const [nav, button] = [screen.getByRole('navigation'), screen.getByRole('button')]
  const expanded = button.getAttribute('aria-label')
  await user.click(button)
  return [nav.getAttribute('aria-label'), expanded, button.getAttribute('aria-label')]
}

const ENGLISH = ['Sidebar', 'Collapse the sidebar', 'Expand the sidebar']
const ARABIC = ['الشريط الجانبي', 'طي الشريط الجانبي', 'توسيع الشريط الجانبي']

describe('the names of the rail and of its toggle come from labels (R-5.11-1)', () => {
  it('are English with no provider, the fallback every client part has', async () => {
    expect(await names(rail)).toEqual(ENGLISH)
  })

  it('are English under an English provider', async () => {
    expect(await names(<TopClassProvider direction="ltr" locale="en">{rail}</TopClassProvider>)).toEqual(ENGLISH)
  })

  it('are Arabic under an Arabic provider', async () => {
    expect(await names(<TopClassProvider direction="rtl" locale="ar">{rail}</TopClassProvider>)).toEqual(ARABIC)
  })

  it('are Arabic for a regional Arabic locale too, since the language decides', async () => {
    expect(await names(<TopClassProvider direction="rtl" locale="ar-EG">{rail}</TopClassProvider>)).toEqual(ARABIC)
  })

  it('follow the nearest provider, so an Arabic island on an English page is named in Arabic', async () => {
    expect(await names(
      <TopClassProvider direction="ltr" locale="en">
        <TopClassProvider direction="rtl" locale="ar">{rail}</TopClassProvider>
      </TopClassProvider>,
    )).toEqual(ARABIC)
  })

  it('follow an app that changes one of the three strings, and leave the other two alone', async () => {
    expect(await names(
      <TopClassProvider direction="ltr" locale="en" labels={{ sidebar: { collapse: 'Hide the menu' } }}>{rail}</TopClassProvider>,
    )).toEqual(['Sidebar', 'Hide the menu', 'Expand the sidebar'])
  })

  it('read the three keys of sidebar, in both languages', () => {
    expect(en.sidebar).toEqual({ label: 'Sidebar', collapse: 'Collapse the sidebar', expand: 'Expand the sidebar' })
    expect(ar.sidebar).toEqual({ label: 'الشريط الجانبي', collapse: 'طي الشريط الجانبي', expand: 'توسيع الشريط الجانبي' })
  })

  it('write no English into the markup of an Arabic rail, in either state', async () => {
    const user = userEvent.setup()
    render(<TopClassProvider direction="rtl" locale="ar"><SidebarRoot><SidebarHeader>مساحة العمل</SidebarHeader></SidebarRoot></TopClassProvider>)
    const nav = screen.getByRole('navigation')
    for (let press = 0; press < 2; press++) {
      expect(nav.outerHTML).not.toMatch(/Sidebar|Collapse|Expand|labels=|\[object/)
      await user.click(screen.getByRole('button'))
    }
  })
})

describe('a name the caller gives', () => {
  it('replaces the name of the rail and leaves the toggle its own', async () => {
    expect(await names(<SidebarRoot aria-label="Documentation"><SidebarHeader>Docs</SidebarHeader></SidebarRoot>))
      .toEqual(['Documentation', 'Collapse the sidebar', 'Expand the sidebar'])
  })

  it('an empty one names nothing, so the label stands in for it, in the language of the provider', async () => {
    expect((await names(<SidebarRoot aria-label=""><SidebarHeader>Docs</SidebarHeader></SidebarRoot>))[0]).toBe('Sidebar')
  })

  it('an empty one under an Arabic provider falls back to the Arabic label', () => {
    render(<TopClassProvider direction="rtl" locale="ar"><SidebarRoot aria-label="" /></TopClassProvider>)
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('الشريط الجانبي')
  })
})
