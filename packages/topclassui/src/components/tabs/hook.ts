'use client'

import { createContext, useContext, useMemo, useState } from 'react'

import { useServerTabStop } from '#shared/use-server-tab-stop.js'
import { TABS_DEFAULTS } from './constants.js'
import type { TabsLook } from './types.js'

const fallback: TabsLook = { variant: TABS_DEFAULTS.variant, size: TABS_DEFAULTS.size, opensOn: undefined }

/** The look of the nearest TabsRoot. Base UI tells its list and its tabs nothing of ours, and a
 * selector on an ancestor would also match the tabs of a TabsRoot nested inside a panel. */
export const TabsLookContext = createContext(fallback)

/** What TabsRoot provides: one object per look, so a root that renders again re-renders no tab.
 * The value it opens on is read once: 0 when neither prop names one, as in Base UI. */
export function useTabsRoot(variant: TabsLook['variant'], size: TabsLook['size'], value: unknown, defaultValue: unknown) {
  const [opensOn] = useState(() => (value === undefined ? (defaultValue === undefined ? 0 : defaultValue) : value))
  return useMemo(() => ({ variant, size, opensOn }), [variant, size, opensOn])
}

/** What TabsList reads: the variant its root was given. */
export function useTabsLook() {
  return useContext(TabsLookContext)
}

/** What TabsTab reads: the look, and a tab stop for the server HTML alone on the tab the page opens
 * on, so a list that scrolls can be reached by the keyboard before the page hydrates. */
export function useTabsTab(value: unknown) {
  const { variant, size, opensOn } = useContext(TabsLookContext)
  const stop = useServerTabStop(value === opensOn)
  return { variant, size, stop }
}
