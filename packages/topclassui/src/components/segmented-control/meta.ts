// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  name: 'SegmentedControl',
  slug: 'segmented-control',
  // The design files it under Actions; the catalog (PLAN 18) under forms, and the catalog wins.
  category: 'forms',
  tier: 2,
  // PLAN 20 is not met until the visual matrix, Firefox and WebKit, and the docs page exist.
  status: 'beta',
  rendering: 'client',
  baseUi: 'radio-group',
  baseUiRange: '1.8.0',
  optionalDeps: [],
} satisfies ComponentMeta
