import type { ComponentPropsWithRef } from 'react'
import { createPortal } from 'react-dom'
import { describe, expect, it } from 'vitest'

import { bulletRecords, rootPropsFailures } from './root-props.js'

// The broken samples the walk in root-props.dom.test.tsx must reject, so the check cannot pass by measuring nothing.
type Props = ComponentPropsWithRef<'div'>

const Spreads = ({ className, ref, ...rest }: Props) => <div {...rest} ref={ref} className={className} />
const DropsClassName = ({ className, ...rest }: Props) => <div {...rest} data-dropped={className} />
const DropsStyle = ({ style, ...rest }: Props) => <div {...rest} data-dropped={style ? '' : undefined} />
const DropsRef = ({ ref, ...rest }: Props) => <div {...rest} data-dropped={ref ? '' : undefined} />
const DropsRest = ({ className, style, ref }: Props) => <div ref={ref} className={className} style={style} />
const SpreadsInside = ({ className, ref, ...rest }: Props) => <section><div {...rest} ref={ref} className={className} /></section>
const SpreadsDeeper = ({ className, ref, ...rest }: Props) => <section><p><div {...rest} ref={ref} className={className} /></p></section>
const SecondButton = (props: Props) => <span><button type="button" /><button type="button" {...(props as ComponentPropsWithRef<'button'>)} /></span>
const RefInside = ({ className, ref, ...rest }: Props) => <div {...rest} className={className}><span ref={ref} /></div>
const Headless = ({ children }: Props) => <>{children}</>
const RendersAlone = () => <div />
const Owned = ({ className, ref, ...rest }: Props) => <div {...rest} ref={ref} className={`own ${className ?? ''}`} />
const InPortal = ({ className, ref, ...rest }: Props) => createPortal(<div {...rest} ref={ref} className={className} />, document.body)
const InBaseUiPortal = (props: Props) => createPortal(
  <div data-base-ui-portal=""><div role="presentation"><div role="dialog" {...props} /></div></div>,
  document.body,
)
const InGroupInPortal = (props: Props) => createPortal(
  <div data-base-ui-portal=""><div role="group"><div role="dialog" {...props} /></div></div>,
  document.body,
)
const Wrapper = ({ children }: Props) => <ul>{children}</ul>

const DECISION = { decision: 'a heading' }
const DIALOG = { root: '[role="dialog"]', ...DECISION }

describe('rootPropsFailures', () => {
  it('passes a component that spreads all four onto its root', async () => {
    expect(await rootPropsFailures(Spreads, { props: {} })).toEqual([])
  })

  it('rejects a component that drops the className', async () => {
    expect(await rootPropsFailures(DropsClassName, { props: {} })).toEqual(['className reaches 0 elements, not one'])
  })

  it('rejects a component that drops the style', async () => {
    expect(await rootPropsFailures(DropsStyle, { props: {} })).toEqual(['style reaches 0 elements, not one'])
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
      .toEqual(['className, style, ref, data land on <div> and <span>, not one root'])
  })

  it('compares the place of a wrapped part with what the wrapper alone renders', async () => {
    expect(await rootPropsFailures(Spreads, { props: {}, wrap: (el) => <Wrapper>{el}</Wrapper> })).toEqual([])
    expect(await rootPropsFailures(SpreadsInside, { props: {}, wrap: (el) => <Wrapper>{el}</Wrapper> }))
      .toEqual(['<div> sits inside section; the root is its outermost element'])
  })

  it('rejects a wrapper that renders an element with the classes of the root, which would hide where the root sits', async () => {
    expect(await rootPropsFailures(Owned, { props: {}, wrap: (el) => <Wrapper>{el}</Wrapper> })).toEqual([])
    expect(await rootPropsFailures(Owned, { props: {}, wrap: (el) => <div className="own">{el}</div> }))
      .toEqual(['the parents in wrap render an element with the classes of <div>, so its place proves nothing'])
  })

  it('rejects a root in a portal unless the case records it', async () => {
    expect(await rootPropsFailures(InPortal, { props: {} })).toEqual(['<div> renders outside the tree; record the case as a portal'])
  })

  it('holds a recorded portal to its selector, to a portal, and to presentation boxes between the two', async () => {
    expect(await rootPropsFailures(InBaseUiPortal, { props: {}, portal: DIALOG })).toEqual([])
    expect(await rootPropsFailures(InBaseUiPortal, { props: {}, portal: { root: '[role="menu"]', ...DECISION } }))
      .toEqual(['<div> is not the recorded [role="menu"]'])
    expect(await rootPropsFailures(InGroupInPortal, { props: {}, portal: DIALOG }))
      .toEqual(['<div> sits inside <div>, which is no presentation box'])
    expect(await rootPropsFailures(Spreads, { props: {}, portal: { root: 'div', ...DECISION } }))
      .toEqual(['<div> renders in no portal; drop the portal record'])
  })

  it('holds a recorded departure to the first match of its selector inside the outermost element', async () => {
    const all = { className: ':scope > div', style: ':scope > div', ref: ':scope > div', data: ':scope > div' }
    expect(await rootPropsFailures(SpreadsInside, { props: {}, target: { ...all, ...DECISION } })).toEqual([])
    expect(await rootPropsFailures(SpreadsInside, { props: {}, target: { data: ':scope span', ...DECISION } }))
      .toEqual(['<div> sits inside section; the root is its outermost element'])
  })

  it('a targeted element must be the first match, a direct child where the selector says so, and the selector starts at :scope', async () => {
    const button = { className: ':scope > button', style: ':scope > button', ref: ':scope > button', data: ':scope > button', ...DECISION }
    expect(await rootPropsFailures(SecondButton, { props: {}, target: button })).toEqual([
      'className reaches <button>, not the first :scope > button in <span>',
      'style reaches <button>, not the first :scope > button in <span>',
      'ref reaches <button>, not the first :scope > button in <span>',
      'data reaches <button>, not the first :scope > button in <span>',
    ])
    const div = { className: ':scope > div', style: ':scope > div', ref: ':scope > div', data: ':scope > div', ...DECISION }
    expect(await rootPropsFailures(SpreadsDeeper, { props: {}, target: div })).toEqual([
      'className reaches <div>, not the first :scope > div in <section>',
      'style reaches <div>, not the first :scope > div in <section>',
      'ref reaches <div>, not the first :scope > div in <section>',
      'data reaches <div>, not the first :scope > div in <section>',
    ])
    expect(await rootPropsFailures(SpreadsInside, { props: {}, target: { className: 'div', style: 'div', ref: 'div', data: 'div', ...DECISION } }))
      .toEqual(['className: write div against :scope, the outermost element', 'style: write div against :scope, the outermost element',
        'ref: write div against :scope, the outermost element', 'data: write div against :scope, the outermost element'])
  })

  it('lets a headless root pass only while it renders no element', async () => {
    expect(await rootPropsFailures(Headless, { props: {}, headless: DECISION })).toEqual([])
    expect(await rootPropsFailures(Spreads, { props: {}, headless: DECISION }))
      .toEqual(['renders <div> now; drop the headless case and test its root'])
    expect(await rootPropsFailures(RendersAlone, { props: {}, headless: DECISION }))
      .toEqual(['renders 1 element(s) of its own; drop the headless case and test its root'])
  })

  it('resolves an async server component before it renders', async () => {
    const Async = async (props: Props) => { await Promise.resolve(); return <Spreads {...props} /> }
    expect(await rootPropsFailures(Async, { props: {} })).toEqual([])
  })
})

describe('bulletRecords', () => {
  it('finds the export as a whole word, with the rule, in one bullet of the entry', () => {
    expect(bulletRecords('Intro.\n\n- `Select` is held in a span (R-5.7-3).\n- Other.', 'Select')).toBe(true)
    expect(bulletRecords('Intro.\n\n- `SelectRoot` is held in a span (R-5.7-3).', 'Select')).toBe(false)
    expect(bulletRecords('Intro naming Select and R-5.7-3.\n\n- Other.', 'Select')).toBe(false)
    expect(bulletRecords('- Select is held in a span.\n- A rule: R-5.7-3.', 'Select')).toBe(false)
  })
})
