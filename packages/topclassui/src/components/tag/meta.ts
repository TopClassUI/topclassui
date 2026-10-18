// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Tag',
  slug: 'tag',
  category: 'media-and-display',
  tier: 2,
  // PLAN 20 is not met until the visual matrix and the docs page exist.
  status: 'beta',
  // Tag stays on the server; TagRemovable, the one with the x, is the client export.
  rendering: 'split',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
