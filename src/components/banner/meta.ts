// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Banner',
  slug: 'banner',
  category: 'media-and-display',
  tier: 2,
  // PLAN 20 is not met until the visual matrix and the docs page exist.
  status: 'beta',
  // The server half only: the dismiss button of the catalog's Sp row comes with Unit 3.
  rendering: 'server',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
