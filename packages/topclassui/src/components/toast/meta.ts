// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Toast',
  slug: 'toast',
  category: 'overlays',
  tier: 1,
  // PLAN 20 is not met until the visual matrix, Firefox and WebKit, the docs page and the iPhone check exist.
  status: 'beta',
  rendering: 'client',
  baseUi: 'toast',
  baseUiRange: '1.8.0',
  optionalDeps: [],
} satisfies ComponentMeta
