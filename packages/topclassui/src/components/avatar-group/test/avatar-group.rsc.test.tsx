// The rsc project, where React resolves its react-server build and has no client hooks.
import type { ReactElement, ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import type { AvatarFallbackProps, AvatarRootProps } from '#components/avatar/index.js'
import { ar } from '#shared/labels/ar.js'
import { AvatarGroup } from '../index.js'
import type { AvatarGroupProps } from '../types.js'

type Counter = ReactElement<AvatarRootProps & { children: ReactElement<AvatarFallbackProps> }>
interface RootProps { role: string; 'data-size': string; children: [ReactNode[], Counter | undefined] }

/** The element AvatarGroup returns, read before React renders it. */
const element = (count: number, props: AvatarGroupProps = {}) => AvatarGroup({
  ...props,
  children: Array.from({ length: count }, (_, i) => <span key={i}>m</span>),
}) as ReactElement<RootProps>

describe('<AvatarGroup> in a Server Component tree', () => {
  it('returns a span with the group role, with no hook and no context read', () => {
    const root = element(2)
    expect(root.type).toBe('span')
    expect(root.props.role).toBe('group')
    expect(root.props['data-size']).toBe('md')
  })

  it('counts its children with Children.toArray, which the react-server build keeps', () => {
    const [visible, counter] = element(13).props.children
    expect(visible).toHaveLength(4)
    expect(counter?.props['aria-label']).toBe('9 more')
  })

  it('renders no counter element when every child fits', () => {
    const [visible, counter] = element(4).props.children
    expect(visible).toHaveLength(4)
    expect(counter).toBeUndefined()
  })

  it('builds the counter from the exported AvatarRoot and AvatarFallback, never a copy of them', () => {
    const [, counter] = element(13).props.children
    expect(counter?.type).toBe(AvatarRoot)
    expect(counter?.props.children.type).toBe(AvatarFallback)
  })

  it('hands AvatarRoot the size name, so Avatar alone owns the box', () => {
    expect(element(13, { size: 'xl' }).props.children[1]?.props.size).toBe('xl')
    expect(element(13, { size: 'custom' }).props.children[1]?.props.size).toBe('custom')
    expect(element(13).props.children[1]?.props.size).toBe('md')
  })

  it('names the counter from labels and locale, which arrive as props', () => {
    const [, counter] = element(1004, { labels: ar, locale: 'de' }).props.children
    expect(counter?.props['aria-label']).toBe('1.000 آخرون')
    expect(counter?.props.role).toBe('img')
  })
})
