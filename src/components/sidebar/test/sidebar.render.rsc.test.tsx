// The rsc project, where React resolves its react-server build and has no client hooks.
import * as React from 'react'
import type { ReactElement, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Reference = (() => never) & { client: string }

// client.tsx starts with 'use client', so the header only ever holds a reference to the toggle.
vi.mock('../client.js', () => ({
  SidebarRoot: Object.assign(() => { throw new Error('SidebarRoot ran on the server') }, { client: 'SidebarRoot' }),
  SidebarTrigger: Object.assign(() => { throw new Error('SidebarTrigger ran on the server') }, { client: 'SidebarTrigger' }),
}))

const { SidebarBody, SidebarHeader, SidebarLink } = await import('../index.js')

interface LinkProps { href: string, children?: ReactNode, className?: string, 'aria-current'?: 'page' }

/** Stands in for next/link, which is not a dependency: a component that requires an href. */
function Link({ href, children, ...rest }: LinkProps) {
  return <a href={href} {...rest}>{children}</a>
}

/** What a part returns, read before React renders it. */
const element = (node: ReactNode) => node as ReactElement<Record<string, unknown>>

describe('the react-server build has what the server parts need, and nothing they must not use', () => {
  it('exports useId, which SidebarGroup calls to name its list', () => {
    expect(typeof React.useId).toBe('function')
  })

  it('exports no state, no effect and no context reader: a part that called one would fail here', () => {
    const hooks = React as unknown as Record<string, unknown>
    expect([typeof hooks['useState'], typeof hooks['useEffect'], typeof hooks['useContext']]).toEqual(['undefined', 'undefined', 'undefined'])
  })
})

describe('<SidebarLink render> in a Server Component tree', () => {
  const item = element(SidebarLink({ render: <Link href="/docs" />, current: true, children: 'Docs' }))
  const link = element(item.props['children'] as ReactNode)

  it('returns a list item around the element it was given, so the framework link is what renders', () => {
    expect(item.type).toBe('li')
    expect(link.type).toBe(Link)
  })

  it('leaves the href the element was written with, and adds aria-current and the classes of a row', () => {
    expect(link.props['href']).toBe('/docs')
    expect(link.props['aria-current']).toBe('page')
    expect(String(link.props['className']).split(' ')).toEqual(expect.arrayContaining(['relative', 'min-h-(--tc-row-height)', 'bg-primary-soft', 'font-semibold']))
  })

  it('hands it nothing a Server Component cannot pass to a client one (R-5.1-3)', () => {
    const given = Object.entries(link.props).filter(([, value]) => value !== undefined)
    expect(given.map(([key, value]) => `${key}: ${typeof value}`).sort()).toEqual(['aria-current: string', 'children: object', 'className: string', 'href: string'])
  })

  it('resolves with no hook, so the stand-in renders its anchor around the label', () => {
    const anchor = element(Link(link.props as unknown as LinkProps))
    expect(anchor.type).toBe('a')
    expect(anchor.props['href']).toBe('/docs')
    const row = element(anchor.props['children'] as ReactNode)
    const label = element((row.props['children'] as ReactNode[])[1])
    expect(label.type).toBe('span')
    expect(label.props['children']).toBe('Docs')
  })
})

describe('<SidebarLink> with no render in a Server Component tree', () => {
  it('returns a plain anchor carrying the href, and no aria-current on a row that is not current', () => {
    const link = element(element(SidebarLink({ href: '/team', children: 'Team' })).props['children'] as ReactNode)
    expect(link.type).toBe('a')
    expect(link.props['href']).toBe('/team')
    expect(link.props['aria-current']).toBeUndefined()
  })
})

describe('the header and the body in a Server Component tree', () => {
  it('the header returns a div whose first child is the reference to the toggle, never the toggle run', () => {
    const header = element(SidebarHeader({ children: 'Workspace' }))
    expect(header.type).toBe('div')
    const [toggle, title] = header.props['children'] as [ReactElement, ReactElement<{ children: ReactNode }>]
    expect((toggle.type as Reference).client).toBe('SidebarTrigger')
    expect(toggle.props).toEqual({})
    expect(title.type).toBe('span')
    expect(title.props.children).toBe('Workspace')
  })

  it('the body returns a div around its children, with no hook and no handler', () => {
    const body = element(SidebarBody({ children: 'Rows' }))
    expect(body.type).toBe('div')
    expect(Object.entries(body.props).filter(([, value]) => typeof value === 'function')).toEqual([])
    expect(body.props['children']).toBe('Rows')
  })
})
