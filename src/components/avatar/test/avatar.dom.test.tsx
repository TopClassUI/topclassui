import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { AvatarFallback, AvatarImage, AvatarRoot, AvatarSkeleton } from '../index.js'

describe('in a real tree', () => {
  it('is found as an image by the alt it was given', () => {
    render(
      <AvatarRoot>
        <AvatarImage src="/team/omar.jpg" alt="Omar Abed" />
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>,
    )
    expect(screen.getByRole('img', { name: 'Omar Abed' }).tagName).toBe('IMG')
  })

  it('keeps the fallback in the document beside the image, ready if the image never paints', () => {
    render(
      <AvatarRoot data-testid="root">
        <AvatarImage src="/team/omar.jpg" alt="Omar Abed" />
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>,
    )
    const root = screen.getByTestId('root')
    expect(screen.getByText('OA').parentElement).toBe(root)
    expect(screen.getByRole('img').parentElement).toBe(root)
    expect(root.children).toHaveLength(2)
  })

  it('is not a tab stop, so Tab goes straight to the control beside it', async () => {
    render(
      <div>
        <AvatarRoot><AvatarFallback>OA</AvatarFallback></AvatarRoot>
        <Button size="sm">Follow</Button>
      </div>,
    )
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Follow' }))
  })

  it('keeps the skeleton out of the accessibility tree', () => {
    const { container } = render(<AvatarSkeleton />)
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('ref', () => {
  it('AvatarRoot receives its span and is cleared on unmount', () => {
    const ref = { current: null as HTMLSpanElement | null }
    const { unmount } = render(<AvatarRoot ref={ref}>OA</AvatarRoot>)
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current?.getAttribute('data-size')).toBe('md')
    unmount()
    expect(ref.current).toBeNull()
  })

  it('AvatarFallback receives its span and is cleared on unmount', () => {
    const ref = { current: null as HTMLSpanElement | null }
    const { unmount } = render(<AvatarFallback ref={ref}>OA</AvatarFallback>)
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current?.textContent).toBe('OA')
    unmount()
    expect(ref.current).toBeNull()
  })

  it('AvatarImage receives its img and is cleared on unmount', () => {
    const ref = { current: null as HTMLImageElement | null }
    const { unmount } = render(<AvatarImage ref={ref} src="/a.jpg" alt="A" />)
    expect(ref.current?.tagName).toBe('IMG')
    expect(ref.current?.getAttribute('alt')).toBe('A')
    unmount()
    expect(ref.current).toBeNull()
  })

  it('reaches the skeleton span too, because a skeleton is a component', () => {
    const ref = { current: null as HTMLSpanElement | null }
    render(<AvatarSkeleton ref={ref} />)
    expect(ref.current?.tagName).toBe('SPAN')
    expect(ref.current?.getAttribute('aria-hidden')).toBe('true')
  })
})
