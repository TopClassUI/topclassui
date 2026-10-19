import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { Alert } from '../index.js'
import { alertVariants } from '../variants.js'
import type { AlertProps } from '../types.js'

const html = (props: AlertProps = {}) =>
  markup(<Alert title="Trial ends" actions="Upgrade" {...props}>Deploys pause.</Alert>)
const classes = (props: AlertProps = {}) => classList(html(props))

/** The class list of the first element whose tag opens with `opening`. */
const partClasses = (source: string, opening: string) =>
  classList(source.slice(source.indexOf(opening)).replace(/>[\s\S]*$/, '>'))

describe('each part wears exactly the classes the spec names', () => {
  it('the root is a top-aligned row on the box radius, the frame\'s 14 px inline and 12 px block counting its edge', () => {
    expect(classes().sort()).toEqual([
      'bg-info-soft', 'border-(length:--tc-line-width)', 'border-transparent', 'flex', 'gap-2.5',
      'items-start', 'px-3.25', 'py-2.75', 'rounded-box', 'text-info-on-soft',
    ])
  })

  it('the body fills the row, may shrink, and breaks a word that has no space', () => {
    expect(partClasses(html(), '<div class="flex min-w').sort())
      .toEqual(['flex', 'flex-1', 'flex-col', 'gap-0.75', 'min-w-0', 'wrap-anywhere'])
  })

  it('the title is a paragraph at the small step in semibold', () => {
    expect(partClasses(html(), '<p ')).toEqual(['text-sm/tight', 'font-semibold'])
  })

  it('the description is the small step and nothing else: no opacity, which would fail 4.5:1', () => {
    expect(partClasses(html(), '<div class="text-sm/tight"')).toEqual(['text-sm/tight'])
  })

  it('the actions are a wrapping row with the spacing Card draws for its own', () => {
    expect(partClasses(html(), '<div class="flex flex-wrap').sort()).toEqual(['flex', 'flex-wrap', 'gap-2', 'pt-1'])
  })

  it('carries the border width on every variant, so changing the variant never moves it', () => {
    for (const variant of ['soft', 'solid', 'outline'] as const) {
      expect(classes({ variant }), variant).toContain('border-(length:--tc-line-width)')
    }
  })
})

describe('an alert is not interactive', () => {
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
    expect(classes({ className: 'mt-4' })).toContain('mt-4')
  })

  it('replaces the radius', () => {
    const list = classes({ className: 'rounded-control' })
    expect(list).toContain('rounded-control')
    expect(list).not.toContain('rounded-box')
  })

  it('replaces the padding and the gap', () => {
    const list = classes({ className: 'px-0 py-1 gap-4' })
    expect(list).toEqual(expect.arrayContaining(['px-0', 'py-1', 'gap-4']))
    expect(list.filter((c) => ['px-3.25', 'py-2.75', 'gap-2.5'].includes(c))).toEqual([])
  })

  it('replaces the fill and the border colour of the tone', () => {
    const list = classes({ tone: 'danger', className: 'bg-surface border-line' })
    expect(list).toEqual(expect.arrayContaining(['bg-surface', 'border-line']))
    expect(list.filter((c) => ['bg-danger-soft', 'border-transparent'].includes(c))).toEqual([])
  })

  it('wins in alertVariants too, the string for an element that cannot be an Alert', () => {
    const list = alertVariants({ className: 'rounded-control' }).split(' ')
    expect(list).toContain('rounded-control')
    expect(list).not.toContain('rounded-box')
  })
})
