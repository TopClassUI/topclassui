// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Tooltip',
  slug: 'tooltip',
  category: 'overlays',
  tier: 1,
  // PLAN 20 is not met until the visual matrix, the browser tests and the docs page exist.
  status: 'beta',
  rendering: 'client',
  baseUi: 'tooltip',
  baseUiRange: '1.8.0',
  optionalDeps: [],
} satisfies ComponentMeta
