'use client'

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { type ReactNode, useContext, useMemo } from 'react'

import { AdaptiveQueryContext, DEFAULT_ADAPTIVE_QUERY } from '../adaptive/use-adaptive-mode.js'
import { COLLECTION_DEFAULTS, type CollectionDefaults } from '../contracts/collection.js'
import { resolveToastSettings, type ToastSettingsInput } from '../contracts/toast.js'
import { createNumberFormat, getLabels, type NumberingSystem } from '../labels/get-labels.js'
import type { PartialLabels } from '../labels/types.js'
import { toastManager } from '../toast/manager.js'
import {
  type Direction, ToastSettingsContext, TopClassContext, type TopClassContextValue,
} from './context.js'

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
  /** Read by the outermost provider only. limit and duration are clamped to TOAST_BOUNDARIES. */
  toast?: ToastSettingsInput | undefined
}

/**
 * Renders the toast provider and the tooltip delay group once, at the outermost provider.
 * An app's own <Tooltip.Provider> belongs inside this one: placed above it, ours shadows it.
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
    toast,
  } = props

  const query = adaptive?.query ?? DEFAULT_ADAPTIVE_QUERY
  // A nested provider, such as an RTL island, joins the outer delay group and the outer toasts.
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

  // Keyed on the three values: a layout passes a new object on every render.
  const { placement, limit, duration } = toast ?? {}
  const toastSettings = useMemo(
    () => resolveToastSettings({ placement, limit, duration }),
    [placement, limit, duration],
  )

  // isolate keeps every overlay above the page without a z-index race.
  const isolated = <div className="isolate contents">{children}</div>

  return (
    <TopClassContext.Provider value={value}>
      <AdaptiveQueryContext.Provider value={query}>
        <DirectionProvider direction={direction}>
          {nested ? isolated : (
            <ToastSettingsContext.Provider value={toastSettings}>
              {/* One store on the shared manager, so add() from outside React lands here. */}
              <Toast.Provider toastManager={toastManager} limit={toastSettings.limit} timeout={toastSettings.duration}>
                {/* One delay group, so moving from one tooltip to the next does not wait again. */}
                <Tooltip.Provider>{isolated}</Tooltip.Provider>
              </Toast.Provider>
            </ToastSettingsContext.Provider>
          )}
        </DirectionProvider>
      </AdaptiveQueryContext.Provider>
    </TopClassContext.Provider>
  )
}
