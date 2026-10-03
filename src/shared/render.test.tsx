import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { renderElement } from './render.js'

const html = (el: React.ReactElement) => renderToStaticMarkup(el)

describe('renderElement', () => {
  it('keeps the element type, so a link stays a link', () => {
    const out = html(renderElement(<a href="/docs" />, { className: 'btn', children: 'Docs' }))
    expect(out).toBe('<a href="/docs" class="btn">Docs</a>')
  })

  it('falls back to the component element when no render prop is given', () => {
    const out = html(renderElement(<button type="button" />, { className: 'btn', children: 'Save' }))
    expect(out).toBe('<button type="button" class="btn">Save</button>')
  })

  it('the consumer className wins a tailwind-merge conflict', () => {
    const out = html(renderElement(<a className="h-control-xl" />, { className: 'h-control-md' }))
    expect(out).toContain('class="h-control-xl"')
    expect(out).not.toContain('h-control-md')
  })

  it('keeps both classes when they do not conflict', () => {
    const out = html(renderElement(<a className="underline" />, { className: 'inline-flex' }))
    expect(out).toContain('inline-flex')
    expect(out).toContain('underline')
  })

  it('the element own props win over the component defaults', () => {
    const out = html(renderElement(<a href="/real" />, { href: '/default' }))
    expect(out).toContain('href="/real"')
  })

  it('passes through the attributes the component sets', () => {
    const out = html(renderElement(<a />, { 'data-variant': 'soft', 'aria-busy': true }))
    expect(out).toContain('data-variant="soft"')
    expect(out).toContain('aria-busy="true"')
  })

  it('the element children win over the component children', () => {
    const out = html(renderElement(<a>Mine</a>, { children: 'Theirs' }))
    expect(out).toBe('<a>Mine</a>')
  })

  it('calls both handlers, the element one first', () => {
    const order: string[] = []
    const ours = vi.fn(() => order.push('ours'))
    const theirs = vi.fn(() => order.push('theirs'))
    const el = renderElement(<button onClick={theirs} />, { onClick: ours })
    const onClick = (el.props as { onClick: (e: unknown) => void }).onClick
    onClick({})
    expect(ours).toHaveBeenCalledTimes(1)
    expect(theirs).toHaveBeenCalledTimes(1)
    expect(order).toEqual(['theirs', 'ours'])
  })

  it('an explicit ref on the render element wins', () => {
    const ourRef = { current: null }
    const theirRef = { current: null }
    const el = renderElement(<a ref={theirRef} />, { ref: ourRef })
    expect((el.props as { ref: unknown }).ref).toBe(theirRef)
  })

  it('uses the component ref when the element has none', () => {
    const ourRef = { current: null }
    const el = renderElement(<a />, { ref: ourRef })
    expect((el.props as { ref: unknown }).ref).toBe(ourRef)
  })

  it('rejects anything that is not an element', () => {
    expect(() => renderElement('nope' as never, {})).toThrow(TypeError)
  })
})
