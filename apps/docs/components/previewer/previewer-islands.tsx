'use client'

// The card's client parts (S8), each its own chunk loaded when the card nears the viewport: the catalog's bundle holds none of them.
import { island } from '../lazy-island'

export const PlaygroundIsland = island(() => import('./playground-island').then((m) => m.PlaygroundIsland))
export const CardModeSwitch = island(() => import('./card-mode-switch').then((m) => m.CardModeSwitch))
export const CopyButton = island(() => import('./copy-button').then((m) => m.CopyButton))
