// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Textarea',
  slug: 'textarea',
  category: 'forms',
  tier: 1,
  // PLAN 20 is not met until the visual matrix and the docs page exist.
  status: 'beta',
  // The native textarea is server HTML; autosize and the counter are the only client parts.
  rendering: 'split',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
