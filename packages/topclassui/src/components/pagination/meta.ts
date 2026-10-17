// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Pagination',
  slug: 'pagination',
  category: 'navigation-and-disclosure',
  tier: 1,
  // PLAN 20 is not met until the visual matrix and the docs page exist.
  status: 'beta',
  rendering: 'server',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
