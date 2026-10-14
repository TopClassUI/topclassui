import { act, fireEvent, render, screen } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AvatarFallback, AvatarImage, AvatarRoot } from '../index.js'
import { readSource } from '../lib.js'

// happy-dom loads no image: every img reads complete and 0 px wide, so decode() is what each test sets.
afterEach(() => { vi.restoreAllMocks() })

const decodes = (outcome: 'resolve' | 'reject') => vi.spyOn(HTMLImageElement.prototype, 'decode')
  .mockImplementation(() => (outcome === 'resolve' ? Promise.resolve() : Promise.reject(new Error('EncodingError'))))

const avatar = (src: string, extra: Record<string, unknown> = {}) => (
  <AvatarRoot data-testid="root">
    <AvatarImage src={src} alt="Omar Abed" {...extra} />
    <AvatarFallback>OA</AvatarFallback>
  </AvatarRoot>
)

describe('an image that fails after the script runs', () => {
  it('takes data-error, stays in the tree, and keeps its alt as the one name', () => {
    decodes('resolve')
    render(avatar('/team/omar.jpg'))
    const image = screen.getByRole('img', { name: 'Omar Abed' })
    expect(image.hasAttribute('data-error')).toBe(false)
    fireEvent.error(image)
    expect(image.getAttribute('data-error')).toBe('')
    expect(screen.getByRole('img', { name: 'Omar Abed' })).toBe(image)
    expect(screen.getByTestId('root').children).toHaveLength(2)
  })

  it("still calls the caller's own onError, with the event", () => {
    decodes('resolve')
    const onError = vi.fn()
    render(avatar('/a.jpg', { onError }))
    fireEvent.error(screen.getByRole('img'))
    expect(onError).toHaveBeenCalledTimes(1)
    expect((onError.mock.calls[0]?.[0] as { type: string }).type).toBe('error')
  })

  it("runs the render element's own onError too, and marks the element it renders", () => {
    decodes('resolve')
    const own = vi.fn()
    render(<AvatarImage render={<img src="/a.jpg" alt="A" onError={own} />} />)
    fireEvent.error(screen.getByRole('img'))
    expect(own).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('img').getAttribute('data-error')).toBe('')
  })
})

describe('a new src starts again', () => {
  it('bad to good clears data-error in the render that brings the new src; good to bad sets it again', () => {
    decodes('resolve')
    const { rerender } = render(avatar('/bad.jpg'))
    const image = screen.getByRole('img')
    fireEvent.error(image)
    expect(image.hasAttribute('data-error')).toBe(true)

    rerender(avatar('/good.jpg'))
    expect(screen.getByRole('img')).toBe(image)
    expect(image.hasAttribute('data-error')).toBe(false)

    rerender(avatar('/bad-again.jpg'))
    expect(image.hasAttribute('data-error')).toBe(false)
    fireEvent.error(image)
    expect(image.hasAttribute('data-error')).toBe(true)
  })

  it('back to a src that failed before is a new attempt too', () => {
    decodes('resolve')
    const { rerender } = render(avatar('/bad.jpg'))
    fireEvent.error(screen.getByRole('img'))
    rerender(avatar('/good.jpg'))
    rerender(avatar('/bad.jpg'))
    expect(screen.getByRole('img').hasAttribute('data-error')).toBe(false)
  })

  it('reads the src off the render element when the part was given none', () => {
    expect(readSource('/a.jpg', undefined)).toBe('/a.jpg')
    expect(readSource(undefined, { props: { src: '/b.jpg' } })).toBe('/b.jpg')
    expect(readSource('/a.jpg', { props: { src: '/b.jpg' } })).toBe('/a.jpg')
    expect(readSource(undefined, { props: {} })).toBeUndefined()
    expect(readSource(undefined, { props: null })).toBeUndefined()
  })
})

/** Server HTML, then hydration: the img failed before React was there to hear it. */
async function hydrated(src: string) {
  const container = document.createElement('div')
  container.innerHTML = renderToString(avatar(src))
  document.body.appendChild(container)
  const image = container.querySelector('img')
  await act(() => { hydrateRoot(container, avatar(src)); return Promise.resolve() })
  return { image, done: () => { container.remove() } }
}

describe('an image that failed before the script ran', () => {
  it('is caught on mount: complete, 0 px wide and refused by decode()', async () => {
    decodes('reject')
    const { image, done } = await hydrated('/team/omar.jpg')
    expect(image?.getAttribute('data-error')).toBe('')
    expect(image?.getAttribute('alt')).toBe('Omar Abed')
    done()
  })

  it('is left alone when decode() accepts it, though it reads complete and 0 px wide', async () => {
    decodes('resolve')
    const { image, done } = await hydrated('/team/omar.svg')
    expect(image?.hasAttribute('data-error')).toBe(false)
    done()
  })

  it('is left alone while it is still loading, and decode() is not even asked', async () => {
    const decode = decodes('reject')
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false)
    const { image, done } = await hydrated('/team/omar.jpg')
    expect(image?.hasAttribute('data-error')).toBe(false)
    expect(decode).not.toHaveBeenCalled()
    done()
  })

  it('a refusal that lands after the src changed marks the old src, never the new one', async () => {
    let refuse: (reason: Error) => void = () => undefined
    vi.spyOn(HTMLImageElement.prototype, 'decode').mockImplementation(() => new Promise((_, reject) => { refuse = reject }))
    const { rerender } = render(avatar('/old.jpg'))
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false)
    rerender(avatar('/new.jpg'))
    await act(() => { refuse(new Error('EncodingError')); return Promise.resolve() })
    expect(screen.getByRole('img').hasAttribute('data-error')).toBe(false)
  })
})

describe('ref', () => {
  it("the caller's ref still reaches the img, beside the one the check reads", () => {
    decodes('resolve')
    const ref = { current: null as HTMLImageElement | null }
    render(avatar('/a.jpg', { ref }))
    expect(ref.current).toBe(screen.getByRole('img'))
  })
})
