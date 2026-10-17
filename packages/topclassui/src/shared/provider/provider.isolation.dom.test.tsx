import { render } from '@testing-library/react'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { TopClassProvider, type TopClassProviderProps } from './provider.js'

/** The div a provider renders: the parent of the marker each test puts inside it. */
const divOf = (container: HTMLElement, marker: string) => {
  const found = container.querySelector(`[data-testid="${marker}"]`)?.parentElement
  if (!found) throw new Error(`no element is marked ${marker}`)
  return found
}

const classes = (element: Element) => [...element.classList]

describe('the isolation root (PLAN 10.2)', () => {
  it('is one div around the children, with isolate and no contents: without a box isolate makes no stacking context', () => {
    const { container } = render(
      <TopClassProvider direction="ltr" locale="en"><span data-testid="app">x</span></TopClassProvider>,
    )
    expect(container.children).toHaveLength(1)
    const root = divOf(container, 'app')
    expect(root).toBe(container.firstElementChild)
    expect(root.tagName).toBe('DIV')
    expect(classes(root)).toEqual(['isolate'])
    expect(classes(root)).not.toContain('contents')
  })

  it('carries no inline style and no attribute but its class, so nothing else decides its box', () => {
    const { container } = render(
      <TopClassProvider direction="rtl" locale="ar"><span data-testid="app">x</span></TopClassProvider>,
    )
    expect(divOf(container, 'app').getAttributeNames()).toEqual(['class'])
  })
})

describe('a nested provider, such as an RTL island', () => {
  const island = (className?: string) => render(
    <TopClassProvider direction="ltr" locale="en">
      <span data-testid="page">page</span>
      <TopClassProvider direction="rtl" locale="ar" className={className}><span data-testid="island">island</span></TopClassProvider>
    </TopClassProvider>,
  )

  it('joins the outer isolation root: its own div has no box and does not isolate again', () => {
    const { container } = island()
    expect(classes(divOf(container, 'page'))).toEqual(['isolate'])
    expect(classes(divOf(container, 'island'))).toEqual(['contents'])
  })

  it('sits inside the outer root, so one stacking context holds the page and the island', () => {
    const { container } = island()
    expect(divOf(container, 'island').parentElement).toBe(divOf(container, 'page'))
    expect(container.querySelectorAll('.isolate')).toHaveLength(1)
  })

  it('takes a box when the caller gives it one: a display class replaces contents', () => {
    expect(classes(divOf(island('flex').container, 'island'))).toEqual(['flex'])
    expect(classes(divOf(island('block isolate').container, 'island'))).toEqual(['block', 'isolate'])
  })
})

describe('className reaches the div the provider renders (R-5.7-3)', () => {
  const root = (className: string) => {
    const { container } = render(
      <TopClassProvider direction="ltr" locale="en" className={className}><span data-testid="app">x</span></TopClassProvider>,
    )
    return divOf(container, 'app')
  }

  it('puts the layout a body used to hold after isolate, the form e2e/provider.spec.ts measures', () => {
    expect(root('flex min-h-dvh flex-col').className).toBe('isolate flex min-h-dvh flex-col')
    expect(root('grid min-h-dvh grid-rows-[auto_1fr_auto]').className).toBe('isolate grid min-h-dvh grid-rows-[auto_1fr_auto]')
    expect(root('h-full').className).toBe('isolate h-full')
  })

  it('lets the caller win a conflict with the root, as every className does (R-5.2-2)', () => {
    expect(root('isolation-auto').className).toBe('isolation-auto')
  })

  it('is a string, so it crosses from a Server Component, and is optional', () => {
    expectTypeOf<TopClassProviderProps['className']>().toEqualTypeOf<string | undefined>()
  })
})
