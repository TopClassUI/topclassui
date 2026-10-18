import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { BannerDismissible } from '../index.js'

afterEach(() => {
  localStorage.clear()
})

/** Each test takes its own id: the memory fallback lives as long as the module does. */
let next = 0
const fresh = () => `dismissible-${String(next++)}`

describe('BannerDismissible, the client export', () => {
  it('renders the region, the message and the x of a dismissible Banner, in the same order', () => {
    render(<BannerDismissible aria-label="Notice" tone="warning" id={fresh()} action={<a href="#more">More</a>}>Out.</BannerDismissible>)
    const region = screen.getByRole('region', { name: 'Notice' })
    expect(region.getAttribute('data-tone')).toBe('warning')
    expect([...region.children].map((child) => child.tagName)).toEqual(['DIV', 'A', 'BUTTON'])
    expect(region.firstElementChild?.textContent).toBe('Out.')
  })

  it('opens no gap for an empty message, as Banner does', () => {
    render(<BannerDismissible aria-label="Notice" id={fresh()} />)
    expect([...screen.getByRole('region').children].map((child) => child.tagName)).toEqual(['BUTTON'])
  })

  it('takes the ref and the rest, and the caller className wins a conflict', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<BannerDismissible ref={ref} aria-label="Notice" id={fresh()} data-testid="b" className="px-2">Out.</BannerDismissible>)
    expect(ref.current?.getAttribute('data-testid')).toBe('b')
    expect(ref.current?.className.split(' ')).toContain('px-2')
    expect(ref.current?.className.split(' ')).not.toContain('px-5')
  })
})
