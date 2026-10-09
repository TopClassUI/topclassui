import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Banner } from '../index.js'
import { bannerVariants } from '../variants.js'

const html = (className?: string) =>
  markup(<Banner aria-label="Notice" action="Upgrade" className={className}>Deploys pause.</Banner>)
const classes = (className?: string) => classList(html(className))

describe('each part wears exactly the classes the spec names', () => {
  it('the root is a full-width centred row, 20 px inline and 12 px block, in medium at the small step', () => {
    expect(classes().sort()).toEqual([
      'bg-primary-soft', 'flex', 'font-medium', 'gap-3', 'items-center', 'px-5', 'py-3',
      'text-primary-on-soft', 'text-sm', 'w-full', 'wrap-anywhere',
    ])
  })

  it('has no radius and no border, because it spans the page', () => {
    expect(classes().filter((c) => /^(rounded|border)/.test(c))).toEqual([])
  })

  it('breaks a word that has no space, so a URL stays inside the row', () => {
    expect(classes()).toContain('wrap-anywhere')
  })

  it('the message fills the row and may shrink below its longest word', () => {
    expect(html()).toContain('<div class="min-w-0 flex-1">Deploys pause.</div>')
  })

  it('is in the page flow: sticky and placement are not built', () => {
    expect(classes().filter((c) => /^(sticky|fixed|absolute|top-|bottom-|inset-|z-)/.test(c))).toEqual([])
  })
})

describe('a banner is not interactive', () => {
  it('carries no ring, hover, transition, touch target or disabled style', () => {
    const interactive = /(^|:)(hover|active|focus-visible|disabled|data-disabled):|^(outline-|transition|duration-|min-h-|cursor-)/
    expect(html().match(/class="[^"]*"/g)?.join(' ').split(/[\s"=]+/).filter((c) => interactive.test(c))).toEqual([])
  })

  it('is not a tab stop of its own', () => {
    expect(html()).not.toContain('tabindex')
  })
})

describe('className is merged last, so the consumer wins every conflict', () => {
  it('keeps a consumer utility that conflicts with nothing', () => {
    expect(classes('sticky')).toContain('sticky')
  })

  it('replaces the padding and the gap', () => {
    const list = classes('px-0 py-1 gap-4')
    expect(list).toEqual(expect.arrayContaining(['px-0', 'py-1', 'gap-4']))
    expect(list.filter((c) => ['px-5', 'py-3', 'gap-3'].includes(c))).toEqual([])
  })

  it('replaces the fill of the tone', () => {
    const list = classes('bg-surface')
    expect(list).toContain('bg-surface')
    expect(list).not.toContain('bg-primary-soft')
  })

  it('wins in bannerVariants too, the string for an element that cannot be a Banner', () => {
    const list = bannerVariants({ className: 'px-0' }).split(' ')
    expect(list).toContain('px-0')
    expect(list).not.toContain('px-5')
  })
})
