// The rsc project, where React resolves its react-server build and has no client hooks.
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { circleNotch } from '#icons/data/circle-notch.js'
import { Svg, type SvgProps } from '#components/svg/index.js'
import { Spinner } from '../index.js'
import type { SpinnerProps } from '../types.js'

/** The element Spinner returns, read before React renders it. */
const element = (props: SpinnerProps = {}) => Spinner(props) as ReactElement<SvgProps>

describe('<Spinner> in a Server Component tree', () => {
  it('returns a <Svg> and nothing around it, so the root is the svg itself', () => {
    expect(element().type).toBe(Svg)
  })

  it('hands Svg the circle-notch glyph, never flipped', () => {
    const { props } = element()
    expect(props.icon).toBe(circleNotch)
    expect(props.flipRtl).toBe(false)
  })

  it('hands Svg the size name, so Svg alone owns the icon scale', () => {
    expect(element({ size: 'lg' }).props.size).toBe('lg')
    expect(element().props.size).toBe('md')
  })

  it('hands Svg no size for custom, so Svg keeps its 1em default', () => {
    expect(element({ size: 'custom' }).props.size).toBeUndefined()
  })

  it('hands Svg the label, or none for aria-hidden', () => {
    expect(element().props.label).toBe('Loading')
    expect(element({ 'aria-hidden': true }).props.label).toBeUndefined()
  })
})
