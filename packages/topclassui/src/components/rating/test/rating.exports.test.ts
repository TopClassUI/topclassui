import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import * as rating from '../index.js'

const source = (file: string) => readFileSync(join(import.meta.dirname, '..', file), 'utf8')

describe('index.tsx adds one public name, Rating', () => {
  it('exports Rating and nothing else at runtime: the client half is internal', () => {
    expect(Object.keys(rating)).toEqual(['Rating'])
    expect(typeof rating.Rating).toBe('function')
  })

  it('has no client directive, and imports the client half from ./client.js only', () => {
    const index = source('index.tsx')
    expect(index).not.toMatch(/^['"]use client['"]/m)
    expect(index.match(/from '\.\/client\.js'/g)).toEqual(["from './client.js'"])
    expect(index).toContain("import { RatingField } from './client.js'")
  })

  it('client.tsx and hook.ts start with the directive; the star part, which the server half imports, does not', () => {
    expect(source('client.tsx').startsWith("'use client'")).toBe(true)
    expect(source('hook.ts').startsWith("'use client'")).toBe(true)
    expect(source('parts/rating-star.tsx').startsWith("'use client'")).toBe(false)
  })
})
