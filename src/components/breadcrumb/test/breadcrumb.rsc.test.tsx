// The rsc project, where React resolves its react-server build and has no client hooks.
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem } from '../types.js'

const TRAIL: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { label: 'Breadcrumb' },
]

interface NavProps { 'aria-label': string; className: string; children: ReactElement[] }

interface Crumb { href?: string; prefetch?: boolean; className: string }
type List = ReactElement<{ children: ReactElement<{ children: [unknown, ReactElement<Crumb>] }>[] }>

/** A stand-in for next/link: a client component, which a server tree names and never calls. */
function Link({ prefetch, ...rest }: { href: string; prefetch?: boolean; className?: string }) {
  return <a data-prefetch={String(prefetch)} {...rest} />
}

/** The element Breadcrumb returns, read before React renders it. */
const element = (items: BreadcrumbItem[]) => Breadcrumb({ items }) as ReactElement<NavProps> | null

describe('<Breadcrumb> in a Server Component tree', () => {
  it('runs with no client hook and returns the nav itself as the root', () => {
    expect(element(TRAIL)?.type).toBe('nav')
    expect(element(TRAIL)?.props['aria-label']).toBe('Breadcrumb')
  })

  it('clones the link element once per crumb with the item href, and calls no hook to do it', () => {
    const trail = [{ href: '/', label: 'Home' }, { href: '/docs', label: 'Docs' }, { label: 'Breadcrumb' }]
    const nav = Breadcrumb({ items: trail, link: <Link href="" prefetch={false} /> }) as unknown as ReactElement<{ children: [List] }>
    const crumbs = nav.props.children[0].props.children.map((item) => item.props.children[1])

    expect(crumbs.map((crumb) => crumb.type)).toEqual([Link, Link, 'span'])
    expect(crumbs.map((crumb) => crumb.props.href)).toEqual(['/', '/docs', undefined])
    expect(crumbs.map((crumb) => crumb.props.prefetch)).toEqual([false, false, undefined])
    expect(crumbs[0]?.props.className.split(' ')).toContain('min-h-[var(--tc-target-min,24px)]')
  })

  it('returns null for an empty trail', () => {
    expect(element([])).toBeNull()
  })

  it('hands the JSON-LD over as a string, which is all that crosses to the document', () => {
    const script = element(TRAIL)?.props.children[1] as ReactElement<{
      type: string
      dangerouslySetInnerHTML: { __html: string }
    }>
    expect(script.type).toBe('script')
    expect(script.props.type).toBe('application/ld+json')
    expect(script.props.dangerouslySetInnerHTML.__html).toBe(
      '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"/"}]}',
    )
  })
})
