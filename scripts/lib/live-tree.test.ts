import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { useDirection, useLabels, useLocale } from '#shared/provider/context.js'
import { liveTree } from './live-tree.js'

/** A demo that prints what the provider above it says, as a client component would read it. */
function Probe() {
  return createElement('p', null, `${useDirection()} ${useLocale()} ${useLabels().common.close}`)
}

describe('the tree a live page renders and hydrates', () => {
  it('mounts the demo inside the provider, with the direction and the locale of the page', () => {
    expect(renderToString(liveTree(Probe, 'rtl', 'ar'))).toContain('<p>rtl ar إغلاق</p>')
    expect(renderToString(liveTree(Probe, 'ltr', 'en'))).toContain('<p>ltr en Close</p>')
  })

  it('renders the same markup with and without the hydration callback, which only an effect calls', () => {
    let called = 0
    const withCallback = renderToString(liveTree(Probe, 'ltr', 'en', () => { called += 1 }))
    expect(withCallback).toBe(renderToString(liveTree(Probe, 'ltr', 'en')))
    // No effect runs on the server: the flag is the browser's to set.
    expect(called).toBe(0)
  })
})
