'use client'

// TopClassProvider at the root (R-13-1), its own chunk: the toast region and the tooltip group load after the first paint, and the page hydrates under it then.
import { island } from '../lazy-island'

export const TopClassProvider = island(() => import('topclassui/provider').then((m) => m.TopClassProvider), 'idle')
