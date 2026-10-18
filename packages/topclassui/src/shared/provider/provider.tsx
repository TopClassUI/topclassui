'use client'

import { DirectionProvider } from '@base-ui/react/direction-provider'
import { Toast } from '@base-ui/react/toast'
import { Tooltip } from '@base-ui/react/tooltip'
import { type ReactNode, useContext, useMemo } from 'react'

import { AdaptiveQueryContext, DEFAULT_ADAPTIVE_QUERY } from '../adaptive/use-adaptive-mode.js'
import { cn } from '../cn.js'
import { COLLECTION_DEFAULTS, type CollectionDefaults } from '../contracts/collection.js'
import { resolveToastSettings, type ToastSettingsInput } from '../contracts/toast.js'
import { createNumberFormat, getLabels, type NumberingSystem } from '../labels/get-labels.js'
import type { ProviderLabels } from '../labels/types.js'
import { toastManager } from '../toast/manager.js'
// The one planned exception to CLOUD-PLAN 9, a shared file importing a component: Toast ships with the provider.
import { ToastViewport } from '../../components/toast/client.js'
import {
  type Direction, ToastSettingsContext, TopClassContext, type TopClassContextValue,
} from './context.js'
import { useProviderLocale } from './use-provider-locale.js'

export interface TopClassProviderProps {
  children?: ReactNode
  /** For the one div this provider renders: the isolation root, or the boxless div of a nested provider. */
  className?: string | undefined
  /** R-13-1: from the route, never read from document.dir in an effect. */
  direction: Direction
  locale: string
  /** Only the strings you want to change; the rest keep their defaults. A count label is set on the component. */
  labels?: ProviderLabels | undefined
  /** Left out, the locale tag's own -u-nu- decides, as it does for a server half, and Latin digits otherwise. */
  numberingSystem?: NumberingSystem | undefined
  adaptive?: { query?: string | undefined } | undefined
  collection?: Partial<CollectionDefaults> | undefined
  /** Read by the outermost provider only. limit and duration are clamped to TOAST_BOUNDARIES. */
  toast?: ToastSettingsInput | undefined
}

/**
 * Renders the isolation root, the toast provider and the tooltip delay group once, at the outermost
 * provider. An app's own <Tooltip.Provider> belongs inside this one: placed above it, ours shadows it.
 */
export function TopClassProvider(props: TopClassProviderProps) {
  const {
    children,
    className,
    labels: overrides,
    numberingSystem,
    adaptive,
    collection,
    toast,
  } = props
  // A nested provider, such as an RTL island, joins the outer root, delay group and toasts.
  const nested = useContext(TopClassContext) !== null
  const { direction, locale } = useProviderLocale(props.direction, props.locale, nested)

  const query = adaptive?.query ?? DEFAULT_ADAPTIVE_QUERY

  const value = useMemo<TopClassContextValue>(() => {
    const { labels } = getLabels(locale, overrides)
    const numberFormat = createNumberFormat(locale, numberingSystem)
    return {
      direction,
      locale,
      labels,
      numberingSystem: numberFormat.resolvedOptions().numberingSystem,
      numberFormat,
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

  // A real box: on an element with display: contents, isolate creates no stacking context.
  const isolated = <div className={cn(nested ? 'contents' : 'isolate', className)}>{children}</div>

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
                {/* The one live region, after the app, at the outermost provider only: toast.add() needs nothing else. */}
                <ToastViewport />
              </Toast.Provider>
            </ToastSettingsContext.Provider>
          )}
        </DirectionProvider>
      </AdaptiveQueryContext.Provider>
    </TopClassContext.Provider>
  )
}
