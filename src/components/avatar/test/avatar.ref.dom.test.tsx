import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AvatarFallback, AvatarImage, AvatarRoot } from '../index.js'

// happy-dom loads no image, so decode() is set to accept every one: these tests are about the ref alone.
afterEach(() => { vi.restoreAllMocks() })

const decodes = () => vi.spyOn(HTMLImageElement.prototype, 'decode').mockImplementation(() => Promise.resolve())

const avatar = (src: string, extra: Record<string, unknown> = {}) => (
  <AvatarRoot>
    <AvatarImage src={src} alt="Omar Abed" {...extra} />
    <AvatarFallback>OA</AvatarFallback>
  </AvatarRoot>
)

describe('ref', () => {
  it("the caller's ref still reaches the img, beside the one the check reads", () => {
    decodes()
    const ref = { current: null as HTMLImageElement | null }
    render(avatar('/a.jpg', { ref }))
    expect(ref.current).toBe(screen.getByRole('img'))
  })

  it('a stable callback ref is called once per node, as on a plain img, though the picture fails and renders again', () => {
    decodes()
    const calls: string[] = []
    const ref = (node: HTMLImageElement | null) => { calls.push(node ? 'node' : 'null') }
    const { rerender, unmount } = render(avatar('/a.jpg', { ref }))
    fireEvent.error(screen.getByRole('img'))
    rerender(avatar('/b.jpg', { ref }))
    expect(calls).toEqual(['node'])
    unmount()
    expect(calls).toEqual(['node', 'null'])
  })

  it("runs the cleanup a callback ref returns, instead of calling it with null", () => {
    decodes()
    const calls: string[] = []
    const ref = (node: HTMLImageElement | null) => { calls.push(node ? 'node' : 'null'); return () => { calls.push('cleanup') } }
    const { unmount } = render(avatar('/a.jpg', { ref }))
    unmount()
    expect(calls).toEqual(['node', 'cleanup'])
  })

  it('an object ref is emptied when the img goes', () => {
    decodes()
    const ref = { current: null as HTMLImageElement | null }
    const { unmount } = render(avatar('/a.jpg', { ref }))
    unmount()
    expect(ref.current).toBeNull()
  })
})
