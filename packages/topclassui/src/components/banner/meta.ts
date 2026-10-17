// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Banner',
  slug: 'banner',
  category: 'media-and-display',
  tier: 2,
  // PLAN 20 is not met until the visual matrix and the docs page exist.
  status: 'beta',
  // A plain banner is server HTML; only a dismissible one renders the client shell.
  rendering: 'split',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
