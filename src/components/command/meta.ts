// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Command',
  slug: 'command',
  category: 'overlays',
  tier: 3,
  // PLAN 20 is not met until the visual matrix, Firefox and WebKit, and the docs page exist.
  status: 'beta',
  rendering: 'client',
  baseUi: 'autocomplete',
  baseUiRange: '1.8.0',
  optionalDeps: [],
} satisfies ComponentMeta
