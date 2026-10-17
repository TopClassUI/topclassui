// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'TreeView',
  slug: 'tree-view',
  category: 'data',
  tier: 3,
  // PLAN 20 is not met until the visual matrix, Firefox and WebKit, and the docs page exist.
  status: 'beta',
  rendering: 'client',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
