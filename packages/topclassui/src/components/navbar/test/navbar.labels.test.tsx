import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { en } from '#shared/labels/en.js'
import { getLabels } from '#shared/labels/get-labels.js'
import { attr, markup } from '#test/markup.js'
import { NavbarLink, NavbarLinks } from '../index.js'

const nav = (props: Parameters<typeof NavbarLinks>[0] = {}) =>
  markup(<NavbarLinks {...props}><NavbarLink href="/docs">Docs</NavbarLink></NavbarLinks>)

// R-5.11-1: the one built-in string is the name of the landmark, and it comes from labels.
describe('the name of the nav', () => {
  it('is "Main" in English, with no labels passed', () => {
    expect(attr(nav(), 'aria-label')).toBe('Main')
    expect(en.navbar.label).toBe('Main')
  })

  it('is the Arabic label when the Arabic labels are passed', () => {
    expect(attr(nav({ labels: ar }), 'aria-label')).toBe('التنقل الرئيسي')
  })

  it('is whatever the labels say: an app that overrides one string gets it', () => {
    const { labels } = getLabels('en', { navbar: { label: 'Site' } })
    expect(attr(nav({ labels }), 'aria-label')).toBe('Site')
  })

  it('takes labels and locale spread from getLabels, and keeps the locale off the element', () => {
    const html = nav({ ...getLabels('ar') })
    expect(attr(html, 'aria-label')).toBe('التنقل الرئيسي')
    expect(html).not.toContain('locale')
    expect(html).not.toContain('labels')
  })
})

// Two navs on one page must not share a name: the caller's wins, so the second one can be told apart.
describe('the name a caller gives', () => {
  it('replaces the label', () => {
    expect(attr(nav({ 'aria-label': 'Docs sections' }), 'aria-label')).toBe('Docs sections')
  })

  it('replaces the Arabic label too', () => {
    expect(attr(nav({ labels: ar, 'aria-label': 'أقسام المستندات' }), 'aria-label')).toBe('أقسام المستندات')
  })

  it('is written once: the label is not left beside it', () => {
    expect(nav({ 'aria-label': 'Docs sections' }).match(/aria-label=/g)).toHaveLength(1)
  })

  it('an empty aria-label names nothing, so the label stands in for it', () => {
    expect(attr(nav({ 'aria-label': '' }), 'aria-label')).toBe('Main')
  })

  it('with aria-labelledby the nav is named by that text, and takes no aria-label of ours', () => {
    const html = nav({ 'aria-labelledby': 'heading' })
    expect(attr(html, 'aria-labelledby')).toBe('heading')
    expect(html).not.toContain('aria-label=')
  })

  it('with both, both reach the nav as written', () => {
    const html = nav({ 'aria-labelledby': 'heading', 'aria-label': 'Fallback' })
    expect(attr(html, 'aria-labelledby')).toBe('heading')
    expect(attr(html, 'aria-label')).toBe('Fallback')
  })
})
