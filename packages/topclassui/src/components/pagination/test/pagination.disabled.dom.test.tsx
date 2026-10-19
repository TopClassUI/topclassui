import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Pagination } from '../index.js'

const blog = (page: number) => `/blog?page=${String(page)}`

describe('disabled, the state Figma 138:1269 draws', () => {
  it('renders no link at all: every cell is a span still announced as a link, and goes nowhere', () => {
    const { container } = render(<Pagination value={3} pageCount={12} getHref={blog} disabled />)
    expect(container.querySelectorAll('a')).toHaveLength(0)
    const cells = screen.getAllByRole('link')
    expect(cells).toHaveLength(10)
    for (const cell of cells) {
      expect(cell.tagName).toBe('SPAN')
      expect(cell.getAttribute('aria-disabled')).toBe('true')
      expect(cell.getAttribute('data-disabled')).toBe('')
    }
  })

  it('keeps the name and the place of the current page, and drops its fill', () => {
    render(<Pagination value={3} pageCount={12} getHref={blog} disabled />)
    const current = screen.getByRole('link', { name: 'Page 3 of 12' })
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.className.split(' ')).not.toContain('bg-primary-solid')
    expect(current.className.split(' ')).toContain('data-disabled:border-transparent')
  })

  it('marks the nav, and is off by default', () => {
    const { container, rerender } = render(<Pagination value={3} pageCount={12} getHref={blog} disabled />)
    expect(container.querySelector('nav')?.getAttribute('data-disabled')).toBe('')
    rerender(<Pagination value={3} pageCount={12} getHref={blog} />)
    expect(container.querySelector('nav')?.hasAttribute('data-disabled')).toBe(false)
    expect(container.querySelectorAll('a')).toHaveLength(10)
  })
})
