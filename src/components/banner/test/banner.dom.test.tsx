import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { bell } from '#icons/data/bell.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

describe('in a real tree', () => {
  it('is found as a region by its aria-label', () => {
    render(<Banner aria-label="Release announcement">Version 2 is out.</Banner>)
    expect(screen.getByRole('region', { name: 'Release announcement' }).textContent).toBe('Version 2 is out.')
  })

  it('is found as a region by the text aria-labelledby points at', () => {
    render(<Banner aria-labelledby="msg"><span id="msg">Version 2 is out.</span></Banner>)
    expect(screen.getByRole('region', { name: 'Version 2 is out.' }).getAttribute('data-tone')).toBe('primary')
  })

  it('is not a live region, so loading the page announces nothing', () => {
    render(<Banner aria-label="Notice" tone="danger">The last payment failed.</Banner>)
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('keeps the icon out of the accessibility tree, so the message is what is read', () => {
    const { container } = render(<Banner aria-label="Notice" icon={<Svg icon={bell} size="xs" />}>Out.</Banner>)
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('is not a tab stop, but its action is', async () => {
    render(<Banner aria-label="Notice" action={<a href="/changelog">Read more</a>}>Version 2 is out.</Banner>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Read more' }))
  })

  it('has no button to dismiss it: that is the client half', () => {
    render(<Banner aria-label="Notice">Version 2 is out.</Banner>)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('ref', () => {
  it('is a normal prop and receives the root div', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Banner ref={ref} aria-label="Notice">Out.</Banner>)
    expect(ref.current?.tagName).toBe('DIV')
    expect(ref.current?.getAttribute('role')).toBe('region')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLDivElement | null }
    const { unmount } = render(<Banner ref={ref} aria-label="Notice">Out.</Banner>)
    unmount()
    expect(ref.current).toBeNull()
  })
})
