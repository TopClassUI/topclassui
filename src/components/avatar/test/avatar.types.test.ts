import type { AriaRole, CSSProperties, ReactElement, ReactNode, Ref } from 'react'
import { describe, expectTypeOf, it } from 'vitest'

// From the index, so a type it stops re-exporting fails here.
import type {
  AvatarDesignProps, AvatarFallbackProps, AvatarImageProps, AvatarRootProps, AvatarSize,
  AvatarSkeletonProps,
} from '../index.js'

/** Assignability as a value, so a rejected prop is a passing assertion. */
type Accepts<Union, Candidate> = Candidate extends Union ? true : false

type Scale = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'

/** The two forms of the image: a plain img, and the element given in `render`. */
type AsImg = Extract<AvatarImageProps, { render?: undefined }>
type AsElement = Extract<AvatarImageProps, { render: ReactElement }>

describe('size is the shared scale', () => {
  it('is the six names, optional, on the root and the skeleton', () => {
    expectTypeOf<AvatarSize>().toEqualTypeOf<Scale>()
    expectTypeOf<AvatarRootProps['size']>().toEqualTypeOf<Scale | undefined>()
    expectTypeOf<AvatarSkeletonProps['size']>().toEqualTypeOf<Scale | undefined>()
    expectTypeOf<AvatarDesignProps>().toEqualTypeOf<{ size?: Scale | undefined }>()
  })

  it('is not a prop of the image or the fallback, which fill the root', () => {
    expectTypeOf<Accepts<keyof AvatarImageProps, 'size'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarFallbackProps, 'size'>>().toEqualTypeOf<false>()
  })
})

describe('the image requires alt', () => {
  it('alt is a required string on a plain img, and an object without it is not the props', () => {
    expectTypeOf<AsImg['alt']>().toEqualTypeOf<string>()
    expectTypeOf<Accepts<AvatarImageProps, { src: string }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<AvatarImageProps, { src: string; alt: string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<AvatarImageProps, { src: string; alt: undefined }>>().toEqualTypeOf<false>()
  })

  it('takes the native image props and an img ref, and no children', () => {
    expectTypeOf<AvatarImageProps['src']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<AvatarImageProps['ref']>().toEqualTypeOf<Ref<HTMLImageElement> | undefined>()
    expectTypeOf<Accepts<keyof AvatarImageProps, 'loading'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AvatarImageProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarImageProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })
})

describe('the image renders as another element', () => {
  it('takes render as an element, which then carries the alt itself, as next/image requires', () => {
    expectTypeOf<AvatarImageProps['render']>().toEqualTypeOf<ReactElement | undefined>()
    expectTypeOf<AsElement['alt']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<Accepts<AvatarImageProps, { render: ReactElement }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<AvatarImageProps, { render: ReactElement; alt: string; src: string }>>().toEqualTypeOf<true>()
  })

  it('takes no function form, which a Server Component could not call (R-5.7-4)', () => {
    expectTypeOf<Accepts<AvatarImageProps, { render: () => ReactElement }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<AvatarImageProps, { alt: string; render: () => ReactElement }>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<AvatarImageProps, { alt: string; render: string }>>().toEqualTypeOf<false>()
  })

  it('is the only part that takes one: the root and the fallback stay spans', () => {
    expectTypeOf<Accepts<keyof AvatarRootProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarFallbackProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarSkeletonProps, 'render'>>().toEqualTypeOf<false>()
  })
})

describe('the root and the fallback take what a span takes', () => {
  it('className, style, a span ref and any node as children', () => {
    expectTypeOf<AvatarRootProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<AvatarFallbackProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<AvatarRootProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
    expectTypeOf<AvatarFallbackProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
    expectTypeOf<AvatarRootProps['ref']>().toEqualTypeOf<Ref<HTMLSpanElement> | undefined>()
    expectTypeOf<AvatarFallbackProps['ref']>().toEqualTypeOf<Ref<HTMLSpanElement> | undefined>()
    expectTypeOf<AvatarRootProps['children']>().toEqualTypeOf<ReactNode | undefined>()
    expectTypeOf<AvatarFallbackProps['children']>().toEqualTypeOf<ReactNode | undefined>()
  })

  it('keeps the native props, so id, title and aria-* still pass through', () => {
    expectTypeOf<Accepts<keyof AvatarRootProps, 'id'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AvatarRootProps, 'aria-label'>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<keyof AvatarFallbackProps, 'aria-hidden'>>().toEqualTypeOf<true>()
  })

  it('names the root by either attribute, and still takes a role of the caller\'s own', () => {
    expectTypeOf<AvatarRootProps['aria-label']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<AvatarRootProps['aria-labelledby']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<AvatarRootProps['role']>().toEqualTypeOf<AriaRole | undefined>()
    expectTypeOf<Accepts<AvatarRootProps, { 'aria-label': string }>>().toEqualTypeOf<true>()
    expectTypeOf<Accepts<AvatarRootProps, { 'aria-label': string; role: 'group' }>>().toEqualTypeOf<true>()
  })
})

describe('none of the props the spec leaves unbuilt', () => {
  it('has no shape, bordered, status or clickable on the root', () => {
    expectTypeOf<Accepts<keyof AvatarRootProps, 'shape'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarRootProps, 'bordered'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarRootProps, 'status'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarRootProps, 'clickable'>>().toEqualTypeOf<false>()
  })

  it('has no render, tone or variant on the root, because an avatar is drawn one way and is not a link', () => {
    expectTypeOf<Accepts<keyof AvatarRootProps, 'render'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarRootProps, 'tone'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarRootProps, 'variant'>>().toEqualTypeOf<false>()
  })
})

describe('the skeleton takes nothing it would ignore', () => {
  // JSX checks no hyphenated attribute, so the Omit stops only a typed object literal; the order in skeleton.tsx does the rest.
  it('takes no content, and lists no aria-hidden among its props', () => {
    expectTypeOf<Accepts<keyof AvatarSkeletonProps, 'children'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarSkeletonProps, 'aria-hidden'>>().toEqualTypeOf<false>()
    expectTypeOf<Accepts<keyof AvatarSkeletonProps, 'dangerouslySetInnerHTML'>>().toEqualTypeOf<false>()
  })

  it('still takes className, style and a span ref', () => {
    expectTypeOf<AvatarSkeletonProps['className']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<AvatarSkeletonProps['style']>().toEqualTypeOf<CSSProperties | undefined>()
    expectTypeOf<AvatarSkeletonProps['ref']>().toEqualTypeOf<Ref<HTMLSpanElement> | undefined>()
  })
})
