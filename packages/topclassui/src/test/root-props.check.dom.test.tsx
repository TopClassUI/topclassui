import type { ComponentPropsWithRef } from 'react'
import { createPortal } from 'react-dom'
import { describe, expect, it } from 'vitest'

import { rootPropsFailures } from './root-props.js'

// The broken samples the walk in root-props.dom.test.tsx must reject, so the check cannot pass by measuring nothing.
type Props = ComponentPropsWithRef<'div'>

const Spreads = ({ className, ref, ...rest }: Props) => <div {...rest} ref={ref} className={className} />
const DropsClassName = ({ className, ...rest }: Props) => <div {...rest} data-dropped={className} />
const DropsRef = ({ ref, ...rest }: Props) => <div {...rest} data-dropped={ref ? '' : undefined} />
const DropsRest = ({ className, ref }: Props) => <div ref={ref} className={className} />
const SpreadsInside = ({ className, ref, ...rest }: Props) => <section><div {...rest} ref={ref} className={className} /></section>
const RefInside = ({ className, ref, ...rest }: Props) => <div {...rest} className={className}><span ref={ref} /></div>
const Headless = ({ children }: Props) => <>{children}</>
const InPortal = ({ className, ref, ...rest }: Props) => createPortal(<div {...rest} ref={ref} className={className} />, document.body)
const Wrapper = ({ children }: Props) => <ul>{children}</ul>

const DECISION = { decision: 'a heading' }

describe('rootPropsFailures', () => {
  it('passes a component that spreads all three onto its root', async () => {
    expect(await rootPropsFailures(Spreads, { props: {} })).toEqual([])
  })

  it('rejects a component that drops the className', async () => {
    expect(await rootPropsFailures(DropsClassName, { props: {} })).toEqual(['className reaches 0 elements, not one'])
  })

  it('rejects a component that drops the ref', async () => {
    expect(await rootPropsFailures(DropsRef, { props: {} })).toEqual(['ref reaches null, not one'])
  })

  it('rejects a component that drops the rest', async () => {
    expect(await rootPropsFailures(DropsRest, { props: {} })).toEqual(['data reaches 0 elements, not one'])
  })

  it('rejects a component that spreads onto an element inside its root', async () => {
    expect(await rootPropsFailures(SpreadsInside, { props: {} }))
      .toEqual(['<div> sits inside section; the root is its outermost element'])
  })

  it('rejects a ref that reaches another element than the className and the rest', async () => {
    expect(await rootPropsFailures(RefInside, { props: {} }))
      .toEqual(['className, ref and data-* land on <div> and <span>, not one root'])
  })

  it('compares the place of a wrapped part with what the wrapper alone renders', async () => {
    expect(await rootPropsFailures(Spreads, { props: {}, wrap: (el) => <Wrapper>{el}</Wrapper> })).toEqual([])
    expect(await rootPropsFailures(SpreadsInside, { props: {}, wrap: (el) => <Wrapper>{el}</Wrapper> }))
      .toEqual(['<div> sits inside section; the root is its outermost element'])
  })

  it('rejects a root in a portal unless the case says so', async () => {
    expect(await rootPropsFailures(InPortal, { props: {} })).toEqual(['<div> renders outside the tree; mark the case portal'])
    expect(await rootPropsFailures(InPortal, { props: {}, portal: true })).toEqual([])
  })

  it('holds a recorded departure to the element it names', async () => {
    expect(await rootPropsFailures(SpreadsInside, { props: {}, target: { className: 'div', ref: 'div', data: 'div', ...DECISION } }))
      .toEqual([])
    expect(await rootPropsFailures(SpreadsInside, { props: {}, target: { data: 'span', ...DECISION } }))
      .toEqual(['data reaches <div>, not the recorded span'])
  })

  it('lets a headless root pass only while it renders no element', async () => {
    expect(await rootPropsFailures(Headless, { props: {}, headless: DECISION })).toEqual([])
    expect(await rootPropsFailures(Spreads, { props: {}, headless: DECISION }))
      .toEqual(['renders <div> now; drop the headless case and test its root'])
  })

  it('resolves an async server component before it renders', async () => {
    const Async = async (props: Props) => { await Promise.resolve(); return <Spreads {...props} /> }
    expect(await rootPropsFailures(Async, { props: {} })).toEqual([])
  })
})
