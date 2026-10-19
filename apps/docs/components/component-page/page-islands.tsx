'use client'

// The examples' client parts (page 14), each its own chunk loaded near the viewport.
import { island } from '../lazy-island'

export const ExampleKnobs = island(() => import('./example-knobs').then((m) => m.ExampleKnobs))
