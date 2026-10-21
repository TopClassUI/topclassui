'use client'

// The MDX blocks' client parts, each its own chunk loaded near the viewport.
import { island } from '../lazy-island'

export const CodeTabs = island(() => import('./code-tabs').then((m) => m.CodeTabs))
export const CopyButton = island(() => import('../copy-button').then((m) => m.CopyButton))
