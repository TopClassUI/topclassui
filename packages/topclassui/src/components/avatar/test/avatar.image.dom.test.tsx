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

  it('reads the src and srcSet the img renders with: the render element first, as renderElement merges them', () => {
    expect(readSource({ src: '/a.jpg' }, undefined)).toEqual({ src: '/a.jpg', srcSet: undefined })
    expect(readSource({}, { props: { src: '/b.jpg', srcSet: '/b.jpg 1x' } })).toEqual({ src: '/b.jpg', srcSet: '/b.jpg 1x' })
    expect(readSource({ src: '/a.jpg' }, { props: { src: '/b.jpg' } })).toEqual({ src: '/b.jpg', srcSet: undefined })
    expect(readSource({ src: '/a.jpg', srcSet: '/a.jpg 1x' }, { props: { src: undefined } })).toEqual({ src: '/a.jpg', srcSet: '/a.jpg 1x' })
    expect(readSource({}, { props: {} })).toEqual({ src: undefined, srcSet: undefined })
    expect(readSource({}, { props: null })).toEqual({ src: undefined, srcSet: undefined })
  })

  it('a render element given a new src after a failure starts again', () => {
    decodes('resolve')
    const { rerender } = render(<AvatarImage render={<img src="/bad.jpg" alt="A" />} />)
    const image = screen.getByRole('img')
    fireEvent.error(image)
    expect(image.getAttribute('data-error')).toBe('')
    rerender(<AvatarImage render={<img src="/good.jpg" alt="A" />} />)
    expect(image.getAttribute('src')).toBe('/good.jpg')
    expect(image.hasAttribute('data-error')).toBe(false)
  })

  it('a picture given by srcSet alone starts again on a new srcSet', () => {
    decodes('resolve')
    const { rerender } = render(<AvatarImage srcSet="/bad.jpg 1x" alt="A" />)
    const image = screen.getByRole('img')
    fireEvent.error(image)
    expect(image.getAttribute('data-error')).toBe('')
    rerender(<AvatarImage srcSet="/good.jpg 1x" alt="A" />)
    expect(image.hasAttribute('data-error')).toBe(false)
  })

  it("a picture that loads is shown again, as when another srcset candidate loads, and the caller's onLoad runs", () => {
    decodes('resolve')
    const onLoad = vi.fn()
    render(<AvatarImage srcSet="/a.jpg 1x, /a@2x.jpg 2x" alt="A" onLoad={onLoad} />)
    const image = screen.getByRole('img')
    fireEvent.error(image)
    expect(image.getAttribute('data-error')).toBe('')
    fireEvent.load(image)
    expect(image.hasAttribute('data-error')).toBe(false)
    expect(onLoad).toHaveBeenCalledTimes(1)
  })
})

/** Server HTML, then hydration: the img failed before React was there to hear it. */
async function hydrated(src: string, extra: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  container.innerHTML = renderToString(avatar(src, extra))
  document.body.appendChild(container)
  const image = container.querySelector('img')
  await act(() => { hydrateRoot(container, avatar(src, extra)); return Promise.resolve() })
  return { image, done: () => { container.remove() } }
}

/** Chromium's decode(): pending while the picture loads, then refused only if it is broken. */
function decodesLikeChromium() {
  const loading = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false)
  const decode = vi.spyOn(HTMLImageElement.prototype, 'decode').mockImplementation(() => new Promise(() => undefined))
  return { decode, loading }
}

describe('an image that failed before the script ran', () => {
  it('is caught on mount: complete, 0 px wide and refused by decode()', async () => {
    decodes('reject')
    const { image, done } = await hydrated('/team/omar.jpg')
    expect(image?.getAttribute('data-error')).toBe('')
    expect(image?.getAttribute('alt')).toBe('Omar Abed')
    done()
  })

  it("calls the caller's onError once, with an error event on the img, as a failure after hydration would", async () => {
    decodes('reject')
    const heard: unknown[][] = []
    const onError = (event: { type: string, currentTarget: unknown }) => { heard.push([event.type, event.currentTarget]) }
    const { image, done } = await hydrated('/team/omar.jpg', { onError })
    expect(heard).toEqual([['error', image]])
    done()
  })

  it('fires no second error when the img already reported its own before decode() refused it', async () => {
    let refuse: (reason: Error) => void = () => undefined
    vi.spyOn(HTMLImageElement.prototype, 'decode').mockImplementation(() => new Promise((_, reject) => { refuse = reject }))
    const onError = vi.fn()
    const { image, done } = await hydrated('/team/omar.jpg', { onError })
    if (image) fireEvent.error(image)
    await act(() => { refuse(new Error('EncodingError')); return Promise.resolve() })
    expect(onError).toHaveBeenCalledTimes(1)
    done()
  })

  it('is left alone when decode() accepts it, though it reads complete and 0 px wide, and onError is not called', async () => {
    decodes('resolve')
    const onError = vi.fn()
    const { image, done } = await hydrated('/team/omar.svg', { onError })
    expect(image?.hasAttribute('data-error')).toBe(false)
    expect(onError).not.toHaveBeenCalled()
    done()
  })

  // A real decode() waits for the load; asking it of every loading picture is work, not a fault.
  it('is left alone while it is still loading, and decode() is not even asked', async () => {
    const { decode } = decodesLikeChromium()
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
