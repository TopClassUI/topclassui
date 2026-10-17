// Feeds the docs navigation and the registry.json generated after v0.1.
import type { ComponentMeta } from '#shared/meta.js'

export const meta = {
  // src/shared/meta.test.ts forces the PascalCase of the folder; the export is OTPField (choice 24).
  name: 'OtpField',
  slug: 'otp-field',
  category: 'forms',
  tier: 3,
  // PLAN 20 is not met until the visual matrix, Firefox and WebKit, and the docs page exist.
  status: 'beta',
  rendering: 'client',
  baseUi: 'otp-field',
  baseUiRange: '1.8.0',
  optionalDeps: [],
} satisfies ComponentMeta
