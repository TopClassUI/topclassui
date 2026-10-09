// The rsc project, where React resolves its react-server build and has no client hooks.
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { Pagination } from '../index.js'
import type { PaginationProps } from '../types.js'

const blog = (page: number) => `/blog?page=${String(page)}`

/** The element Pagination returns, read before React renders it. */
const element = (props: Partial<PaginationProps> = {}) =>
  Pagination({ value: 3, pageCount: 12, getHref: blog, ...props }) as ReactElement<Record<string, unknown>>

describe('<Pagination> in a Server Component tree', () => {
  it('is a plain function that returns a nav, with no hook and no context to read', () => {
    expect(element().type).toBe('nav')
  })

  it('names the nav and reports the size without a provider above it', () => {
    expect(element().props['aria-label']).toBe('Pagination')
    expect(element().props['data-size']).toBe('sm')
  })

  it('takes direction-free labels as a prop, since a Server Component has no context (R-5.1-4)', () => {
    expect(element({ labels: ar, locale: 'ar' }).props['aria-label']).toBe('ترقيم الصفحات')
  })

  it('calls getHref while it renders on the server, so the function never crosses to the client', () => {
    const asked: number[] = []
    element({ getHref: (page) => { asked.push(page); return blog(page) } })
    expect(asked).toEqual([1, 2, 1, 2, 3, 4, 5, 12, 4, 12])
  })
})
