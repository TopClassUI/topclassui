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

/** The element Breadcrumb returns, read before React renders it. */
const element = (items: BreadcrumbItem[]) => Breadcrumb({ items }) as ReactElement<NavProps> | null

describe('<Breadcrumb> in a Server Component tree', () => {
  it('runs with no client hook and returns the nav itself as the root', () => {
    expect(element(TRAIL)?.type).toBe('nav')
    expect(element(TRAIL)?.props['aria-label']).toBe('Breadcrumb')
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
