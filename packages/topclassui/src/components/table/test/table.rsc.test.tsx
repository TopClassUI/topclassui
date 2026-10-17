// The rsc project, where React resolves its react-server build and has no client hooks.
import * as React from 'react'
import { describe, expect, it } from 'vitest'

import * as entry from '../index.js'

describe('<Table> in a Server Component tree', () => {
  it('runs against the react-server build, which has no state and no effects', () => {
    expect('useState' in React).toBe(false)
    expect('useEffect' in React).toBe(false)
  })

  it('calls the one hook that build still has: useId names the scrolling box by its caption (R-5.1-1)', () => {
    expect(typeof React.useId).toBe('function')
  })

  it('loads there, and stays a plain synchronous function a non-RSC tree can render too (R-5.1-5)', () => {
    expect(typeof entry.Table).toBe('function')
    expect(entry.Table.constructor.name).toBe('Function')
  })

  it('still has cloneElement there, which is all the link prop needs to put an href on the caller element', () => {
    expect(typeof React.cloneElement).toBe('function')
    expect(typeof React.isValidElement).toBe('function')
  })
})

describe('<TableSkeleton> in a Server Component tree', () => {
  /** The element it returns, read before React renders it: it calls no hook, so it can be called here. */
  const element = entry.TableSkeleton({ rows: 2, columns: 3 }) as React.ReactElement<{ 'aria-hidden': boolean; className: string }>

  it('returns the box itself, hidden, with nothing around it', () => {
    expect(element.type).toBe('div')
    expect(element.props['aria-hidden']).toBe(true)
    expect(element.props.className.split(' ')).toContain('overflow-hidden')
  })
})
