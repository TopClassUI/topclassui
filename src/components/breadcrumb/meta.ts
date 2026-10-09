// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Breadcrumb',
  slug: 'breadcrumb',
  // PLAN 18.6 lists the row "Breadcrumb, S, 1, Emits structured data" under Navigation and disclosure.
  category: 'navigation-and-disclosure',
  tier: 1,
  // PLAN 20 is not met until the visual matrix and the docs page exist.
  status: 'beta',
  rendering: 'server',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
