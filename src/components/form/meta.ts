// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'Form',
  slug: 'form',
  category: 'forms',
  tier: 1,
  // PLAN 20 is not met until the visual matrix and the docs page exist.
  status: 'beta',
  // Form is a plain form in the server HTML; FormAction is the client half, on React's useActionState.
  rendering: 'split',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
} satisfies ComponentMeta
