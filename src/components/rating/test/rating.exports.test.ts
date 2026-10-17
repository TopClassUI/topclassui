import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import * as rating from '../index.js'

const source = (file: string) => readFileSync(join(import.meta.dirname, '..', file), 'utf8')

describe('index.tsx adds two public names, Rating and its skeleton', () => {
  it('exports Rating and RatingSkeleton and nothing else at runtime: the client half is internal', () => {
    expect(Object.keys(rating).sort()).toEqual(['Rating', 'RatingSkeleton'])
    expect([typeof rating.Rating, typeof rating.RatingSkeleton]).toEqual(['function', 'function'])
  })

  it('has no client directive, and imports the client half from ./client.js only', () => {
    const index = source('index.tsx')
    expect(index).not.toMatch(/^['"]use client['"]/m)
    expect(index.match(/from '\.\/client\.js'/g)).toEqual(["from './client.js'"])
    expect(index).toContain("import { RatingField } from './client.js'")
  })

  it('client.tsx and hook.ts start with the directive; lib.tsx, which the server half imports, does not', () => {
    expect(source('client.tsx').startsWith("'use client'")).toBe(true)
    expect(source('hook.ts').startsWith("'use client'")).toBe(true)
    expect(source('lib.tsx').startsWith("'use client'")).toBe(false)
  })
})
