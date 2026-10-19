'use client'

// Home's client parts, each its own chunk loaded near the viewport.
import { island } from '../lazy-island'

export const VoidIsland = island(() => import('./void-island').then((m) => m.VoidIsland))
export const Switch = island(() => import('topclassui/switch').then((m) => m.Switch))
export const CopyButton = island(() => import('../copy-button').then((m) => m.CopyButton))
