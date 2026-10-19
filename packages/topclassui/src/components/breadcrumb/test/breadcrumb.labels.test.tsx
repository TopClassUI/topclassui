import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { getLabels } from '#shared/labels/get-labels.js'
import { attr, markup } from '#test/markup.js'
import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem, BreadcrumbProps } from '../types.js'

const TRAIL: BreadcrumbItem[] = [
  { href: '/', label: 'Start' },
  { label: 'Page' },
]

const html = (props: Partial<BreadcrumbProps> = {}) => markup(<Breadcrumb items={TRAIL} {...props} />)
const name = (out: string) => attr(/^<nav[^>]*>/.exec(out)?.[0] ?? '', 'aria-label')
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

// R-5.11-1: written out in both languages, so a key swapped in either file fails here.
const EN_LABEL = 'Breadcrumb'
const AR_LABEL = 'مسار التنقل'

describe('the name of the nav comes from labels', () => {
  it('falls back to English when no labels are passed', () => {
    expect(name(html())).toBe(EN_LABEL)
  })

  it('takes the Arabic name from the Arabic labels, and no English name is left', () => {
    const out = html({ labels: ar })
    expect(name(out)).toBe(AR_LABEL)
    expect(out).not.toContain('aria-label="Breadcrumb"')
  })

  it('reads the labels field of getLabels, which is what a layout passes down', () => {
    expect(name(html({ labels: getLabels('ar-EG').labels }))).toBe(AR_LABEL)
    expect(name(html({ labels: getLabels('en-GB').labels }))).toBe(EN_LABEL)
  })

  it('takes the whole pair getLabels returns as a spread, and writes no locale on the nav', () => {
    const out = html({ ...getLabels('ar') })
    expect(name(out)).toBe(AR_LABEL)
    expect(out).not.toMatch(/locale=|\[object/)
    expect(out.startsWith('<nav aria-label="مسار التنقل" class="text-sm"><ol ')).toBe(true)
  })

  it('takes a caller override of that one key', () => {
    const labels = getLabels('en', { breadcrumb: { label: 'You are here' } }).labels
    expect(name(html({ labels }))).toBe('You are here')
  })

  it('reads breadcrumb.label and not the home label beside it', () => {
    const labels = getLabels('en', { breadcrumb: { home: 'Start page' } }).labels
    const out = html({ labels })
    expect(name(out)).toBe(EN_LABEL)
    expect(out).not.toContain('Start page')
  })

  it('writes the name once, on the nav, and never as visible text', () => {
    const out = html({ labels: ar })
    expect(count(out, AR_LABEL)).toBe(1)
    expect(out).not.toContain(`>${AR_LABEL}<`)
  })
})

describe('a name from the caller, handled as Pagination handles one', () => {
  it('falls back to the labels for an empty aria-label, which would name nothing', () => {
    expect(name(html({ 'aria-label': '' }))).toBe(EN_LABEL)
    expect(name(html({ 'aria-label': '', labels: ar }))).toBe(AR_LABEL)
  })

  it('falls back to the labels for an aria-label a wrapper forwards as undefined', () => {
    expect(name(html({ 'aria-label': undefined }))).toBe(EN_LABEL)
    expect(name(html({ 'aria-label': undefined, labels: ar }))).toBe(AR_LABEL)
  })

  it('keeps a real name, written once and in the place of the built-in one', () => {
    const out = html({ 'aria-label': 'Category trail', className: 'mt-2' })
    expect(out.startsWith('<nav aria-label="Category trail" class="text-sm mt-2"><ol ')).toBe(true)
    expect(count(out, 'aria-label=')).toBe(1)
  })
})

describe('the crumbs are the caller\'s own text', () => {
  it('adds no built-in crumb: the first item is the caller\'s, in either language', () => {
    expect(count(html(), '<li')).toBe(2)
    expect(html()).not.toContain('>Home<')
    expect(count(html({ labels: ar }), '<li')).toBe(2)
    expect(html({ labels: ar })).not.toContain('الرئيسية')
  })

  it('never translates a label it was given', () => {
    const out = html({ labels: ar })
    expect(out).toContain('>Start</span></a>')
    expect(out).toContain('>Page</span></li>')
  })

  it('keeps the JSON-LD keys and types in English under Arabic labels, because they are a vocabulary', () => {
    const out = html({ labels: ar, siteUrl: 'https://example.com' })
    expect(out).toContain('"@type":"BreadcrumbList"')
    expect(out).toContain('"@type":"ListItem"')
    expect(out).toContain('"name":"Start"')
  })
})
