import { describe, expect, it } from 'vitest'

import { COLLECTION_DEFAULTS } from './collection.js'
import { DEFAULT_SIZE, SIZES } from './size.js'
import { STATUSES } from './state.js'

describe('the contracts other code depends on', () => {
  it('has the six size names of R-5.7-2, defaulting to md', () => {
    expect(SIZES).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'custom'])
    expect(DEFAULT_SIZE).toBe('md')
    expect(SIZES).toContain(DEFAULT_SIZE)
  })

  it('has the five statuses of the state contract', () => {
    expect(STATUSES).toEqual(['idle', 'loading', 'loading-more', 'error', 'empty'])
  })

  it('carries the collection defaults the plan names', () => {
    expect(COLLECTION_DEFAULTS.visibleRows).toBe(7)
    expect(COLLECTION_DEFAULTS.virtualizeAbove).toBe(200)
    expect(COLLECTION_DEFAULTS.loadMoreThreshold).toBe(10)
  })

  it('keeps every default positive, since each one sizes or counts something', () => {
    for (const [key, value] of Object.entries(COLLECTION_DEFAULTS)) {
      expect(value, key).toBeGreaterThan(0)
    }
  })
})
