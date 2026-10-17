import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, classList, markup as render } from '#test/markup.js'
import { AvatarFallback, AvatarImage, AvatarRoot } from '../index.js'

/** React 19 hoists a preload link ahead of any eager img it renders; the part's own markup follows it. */
const markup = (element: ReactElement) =>
  render(element).replace(/^<link rel="preload" as="image" [^>]*>/, '')

interface ImageProps { src: string; alt: string; width: number; height: number; className?: string }

/** Stands in for next/image, which is not a dependency: it requires src and alt, and renders an img. */
function Image({ src, alt, width, height, className }: ImageProps) {
  return <img data-optimised="" src={`/_next/image?url=${src}`} alt={alt} width={width} height={height} className={className} />
}

describe('AvatarImage renders as the element it is given', () => {
  const html = markup(<AvatarImage render={<Image src="/team/omar.jpg" alt="Omar Abed" width={48} height={48} />} />)

  it('renders the framework image, not a plain img beside it', () => {
    expect(html).toBe(
      '<img data-optimised="" src="/_next/image?url=/team/omar.jpg" alt="Omar Abed" width="48" height="48" class="absolute inset-0 size-full object-cover text-transparent forced-color-adjust-none data-error:opacity-0"/>',
    )
  })

  it('hands it the classes that lay a picture over the fallback and keep a failed one quiet', () => {
    expect(classList(html).sort()).toEqual([
      'absolute', 'data-error:opacity-0', 'forced-color-adjust-none', 'inset-0', 'object-cover', 'size-full', 'text-transparent',
    ])
  })

  it('takes the alt from the element, where next/image requires it', () => {
    expect(attr(html, 'alt')).toBe('Omar Abed')
  })

  it("lets the element's own alt and class win over what AvatarImage was given", () => {
    const both = markup(
      <AvatarImage alt="From the part" className="object-contain" render={<Image src="/a.jpg" alt="From the element" width={40} height={40} className="object-fill" />} />,
    )
    expect(attr(both, 'alt')).toBe('From the element')
    expect(classList(both).filter((c) => c.startsWith('object-'))).toEqual(['object-fill'])
  })

  it('passes its own props into an element that names none of them', () => {
    const plain = markup(<AvatarImage alt="Omar Abed" src="/a.jpg" loading="lazy" className="ms-2" render={<img data-own="" />} />)
    expect(plain).toBe(
      '<img data-own="" alt="Omar Abed" class="absolute inset-0 size-full object-cover text-transparent forced-color-adjust-none data-error:opacity-0 ms-2" src="/a.jpg" loading="lazy"/>',
    )
  })

  it('still sits inside the root over the fallback, in the order given', () => {
    const avatar = markup(
      <AvatarRoot size="lg">
        <AvatarImage render={<Image src="/team/omar.jpg" alt="Omar Abed" width={48} height={48} />} />
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>,
    )
    expect(avatar).toMatch(
      /^<span data-size="lg" class="[^"]+"><img data-optimised="" [^>]+ class="absolute [^"]+"\/><span aria-hidden="true" class="[^"]+">OA<\/span><\/span>$/,
    )
  })
})

describe('AvatarImage with no render is the plain img it always was', () => {
  it('writes alt, class and src, in that order, and nothing else', () => {
    expect(markup(<AvatarImage src="/team/omar.jpg" alt="Omar Abed" />)).toBe(
      '<img alt="Omar Abed" class="absolute inset-0 size-full object-cover text-transparent forced-color-adjust-none data-error:opacity-0" src="/team/omar.jpg"/>',
    )
  })

  it('refuses anything that is not an element, as every render prop here does', () => {
    expect(() => markup(<AvatarImage alt="" render={'img' as never} />)).toThrow(TypeError)
  })
})
