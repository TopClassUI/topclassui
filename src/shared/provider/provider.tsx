'use client'

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { type ReactNode, useMemo } from 'react'

import { AdaptiveQueryContext, DEFAULT_ADAPTIVE_QUERY } from '../adaptive/use-adaptive-mode.js'
import { COLLECTION_DEFAULTS, type CollectionDefaults } from '../contracts/collection.js'
import { createNumberFormat, getLabels, type NumberingSystem } from '../labels/get-labels.js'
import type { PartialLabels } from '../labels/types.js'
import { type Direction, TopClassContext, type TopClassContextValue } from './context.js'

export interface TopClassProviderProps {
  children?: ReactNode
  /** R-13-1: from the route, never read from document.dir in an effect. */
  direction: Direction
  locale: string
  /** Only the strings you want to change; the rest keep their defaults. */
  labels?: PartialLabels | undefined
  numberingSystem?: NumberingSystem | undefined
  adaptive?: { query?: string | undefined } | undefined
  collection?: Partial<CollectionDefaults> | undefined
}

export function TopClassProvider(props: TopClassProviderProps) {
  const {
    children,
    direction,
    locale,
    labels: overrides,
    numberingSystem = 'latn',
    adaptive,
    collection,
  } = props

  const query = adaptive?.query ?? DEFAULT_ADAPTIVE_QUERY

  const value = useMemo<TopClassContextValue>(() => {
    const { labels } = getLabels(locale, overrides)
    return {
      direction,
      locale,
      labels,
      numberingSystem,
      numberFormat: createNumberFormat(locale, numberingSystem),
      adaptive: { query },
      collection: { ...COLLECTION_DEFAULTS, ...collection },
    }
  }, [direction, locale, overrides, numberingSystem, query, collection])

  return (
    <TopClassContext.Provider value={value}>
      <AdaptiveQueryContext.Provider value={query}>
        <DirectionProvider direction={direction}>
          {/* isolate keeps every overlay above the page without a z-index race */}
          <div className="isolate contents">{children}</div>
        </DirectionProvider>
      </AdaptiveQueryContext.Provider>
    </TopClassContext.Provider>
  )
}
