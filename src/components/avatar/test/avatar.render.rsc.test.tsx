// The rsc project, where React resolves its react-server build and has no client hooks.
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { AvatarImage } from '../index.js'

interface ImageProps { src: string; alt: string; width: number; height: number; className?: string }

/** Stands in for next/image, which is not a dependency: a component that requires src and alt. */
function Image({ src, alt, width, height, className }: ImageProps) {
  return <img src={src} alt={alt} width={width} height={height} className={className} />
}

/** The element AvatarImage returns, read before React renders it. */
const element = (props: Parameters<typeof AvatarImage>[0]) => AvatarImage(props) as ReactElement<Partial<ImageProps>>

describe('<AvatarImage render> in a Server Component tree', () => {
  const out = element({ render: <Image src="/team/omar.jpg" alt="Omar Abed" width={48} height={48} /> })

  it('returns the element it was given, so the framework image is what renders', () => {
    expect(out.type).toBe(Image)
  })

  it('leaves the src, alt and size the element was written with', () => {
    expect(out.props.src).toBe('/team/omar.jpg')
    expect(out.props.alt).toBe('Omar Abed')
    expect(out.props.width).toBe(48)
    expect(out.props.height).toBe(48)
  })

  it('adds the avatar classes, which are all the element needs to fill the circle', () => {
    expect(out.props.className).toBe('absolute inset-0 size-full object-cover text-transparent forced-color-adjust-none')
  })

  it('hands it nothing a Server Component cannot pass to a client one (R-5.1-3)', () => {
    const given = Object.entries(out.props as Record<string, unknown>).filter(([, value]) => value !== undefined)
    const kinds = given.map(([key, value]) => `${key}: ${typeof value}`)
    expect(kinds.sort()).toEqual(['alt: string', 'className: string', 'height: number', 'src: string', 'width: number'])
  })

  it('resolves with no hook, so the stand-in renders its img with those classes', () => {
    const img = Image(out.props as ImageProps) as ReactElement<{ className?: string; alt?: string }>
    expect(img.type).toBe('img')
    expect(img.props.alt).toBe('Omar Abed')
    expect(img.props.className).toBe('absolute inset-0 size-full object-cover text-transparent forced-color-adjust-none')
  })
})

describe('<AvatarImage> with no render in a Server Component tree', () => {
  it('returns a plain img carrying the alt and the source', () => {
    const out = element({ src: '/team/omar.jpg', alt: 'Omar Abed' })
    expect(out.type).toBe('img')
    expect(out.props.alt).toBe('Omar Abed')
    expect(out.props.src).toBe('/team/omar.jpg')
  })
})
