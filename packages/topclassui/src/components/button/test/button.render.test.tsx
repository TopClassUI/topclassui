import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Button } from '../index.js'

describe('the render prop', () => {
  it('becomes the element it is given, so a link can look like a button', () => {
    const html = markup(<Button render={<a href="/docs" />}>Docs</Button>)
    expect(html).toMatch(/^<a /)
    expect(attr(html, 'href')).toBe('/docs')
    expect(html).toContain('Docs')
  })

  it('still carries the button look and the design attributes', () => {
    const html = markup(<Button render={<a href="/x" />} tone="danger">Go</Button>)
    expect(attr(html, 'class')).toContain('bg-danger-solid')
    expect(attr(html, 'data-tone')).toBe('danger')
  })

  it('keeps the element its own children when it has them', () => {
    const html = markup(<Button render={<a href="/x">Mine</a>}>Theirs</Button>)
    expect(html).toContain('Mine')
    expect(html).not.toContain('Theirs')
  })

  it('still shows the spinner when the element brought its own children', () => {
    const html = markup(<Button render={<a href="/x">Mine</a>} loading>Theirs</Button>)
    expect(html).toContain('animate-spin')
    expect(html).toContain('Mine')
    expect(html.indexOf('<svg')).toBeLessThan(html.indexOf('Mine'))
  })

  it('merges the element className last, so the consumer still wins', () => {
    const html = markup(<Button render={<a href="/x" className="bg-surface" />}>Go</Button>)
    expect(attr(html, 'class')).toContain('bg-surface')
    expect(attr(html, 'class')).not.toContain('bg-primary-solid')
  })
})
