'use client'

// The guides' client parts, each its own chunk loaded near the viewport, so a guide page carries none of another's.
import { island } from '../lazy-island'

export const IconFinder = island(() => import('./icon-finder').then((m) => m.IconFinder))
export const PageControls = island(() => import('./page-controls').then((m) => m.PageControls))
