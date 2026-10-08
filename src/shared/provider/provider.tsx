'use client'

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { Tooltip } from '@base-ui/react/tooltip'
import { type ReactNode, useContext, useMemo } from 'react'

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

/**
 * Renders the tooltip delay group once, at the outermost provider. An app's own
 * <Tooltip.Provider> belongs inside this one: placed above it, ours shadows it.
 */
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
  // A nested provider, such as an RTL island, joins the outer delay group instead of starting one.
  const nested = useContext(TopClassContext) !== null

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

  // isolate keeps every overlay above the page without a z-index race.
  const isolated = <div className="isolate contents">{children}</div>

  return (
    <TopClassContext.Provider value={value}>
      <AdaptiveQueryContext.Provider value={query}>
        <DirectionProvider direction={direction}>
          {/* One delay group, so moving from one tooltip to the next does not wait again. */}
          {nested ? isolated : <Tooltip.Provider>{isolated}</Tooltip.Provider>}
        </DirectionProvider>
      </AdaptiveQueryContext.Provider>
    </TopClassContext.Provider>
  )
}
