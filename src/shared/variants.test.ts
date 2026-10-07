import { describe, expect, it } from 'vitest'

import { memoizeVariants } from './variants.js'

const ALLOWED = { tone: ['primary', 'danger'], size: ['sm', 'md'] } as const
const DEFAULTS = { tone: 'primary', size: 'md' } as const

const spyResolve = () => {
  const calls: unknown[] = []
  const resolve = (props: { tone: string; size: string }) => {
    calls.push(props)
    return `tone-${props.tone} h-${props.size}`
  }
  return { calls, resolve }
}

describe('a memoized variant function behaves like the plain one', () => {
  it('falls back to the default for every prop left out', () => {
    const { resolve } = spyResolve()
    expect(memoizeVariants(resolve, ALLOWED, DEFAULTS)()).toBe('tone-primary h-md')
  })

  it('takes the value the caller passed', () => {
    const { resolve } = spyResolve()
    expect(memoizeVariants(resolve, ALLOWED, DEFAULTS)({ tone: 'danger' })).toBe('tone-danger h-md')
  })

  it('gives every real combination its own answer, so none collide', () => {
    const { resolve } = spyResolve()
    const look = memoizeVariants(resolve, ALLOWED, DEFAULTS)
    const seen = new Set<string>()
    for (const tone of ALLOWED.tone) for (const size of ALLOWED.size) seen.add(look({ tone, size }))
    expect(seen.size).toBe(ALLOWED.tone.length * ALLOWED.size.length)
  })

  it('appends the consumer classes last, which is what lets them win', () => {
    const { resolve } = spyResolve()
    const look = memoizeVariants(resolve, ALLOWED, DEFAULTS)
    expect(look({ className: 'mt-4' }).endsWith('mt-4')).toBe(true)
    expect(look({ class: 'mt-4' }).endsWith('mt-4')).toBe(true)
  })
})

describe('the cache is a cache, and a bounded one', () => {
  it('resolves each combination once, however often it is asked', () => {
    const { calls, resolve } = spyResolve()
    const look = memoizeVariants(resolve, ALLOWED, DEFAULTS)
    for (let i = 0; i < 50; i++) look({ tone: 'danger', size: 'sm' })
    expect(calls).toHaveLength(1)
  })

  it('still answers a value no list contains, which a JS caller can pass', () => {
    const { resolve } = spyResolve()
    const look = memoizeVariants(resolve, ALLOWED, DEFAULTS)
    expect(look({ tone: 'nope' as never })).toBe('tone-nope h-md')
  })

  it('never caches that answer, or a free string would grow the map without bound', () => {
    const { calls, resolve } = spyResolve()
    const look = memoizeVariants(resolve, ALLOWED, DEFAULTS)
    for (let i = 0; i < 5; i++) look({ tone: 'nope' as never })
    expect(calls).toHaveLength(5)
  })

  it('does not let an unknown value poison a real one', () => {
    const { resolve } = spyResolve()
    const look = memoizeVariants(resolve, ALLOWED, DEFAULTS)
    const before = look({})
    look({ tone: 'nope' as never })
    expect(look({})).toBe(before)
  })
})
