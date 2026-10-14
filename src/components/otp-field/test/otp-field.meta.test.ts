import { describe, expect, it } from 'vitest'

import { meta } from '../meta.js'

// The shared contract checks the shape; this pins OTPField's own row value by value.
describe('the catalog row', () => {
  it('is the row unit-4.md lists for OTPField, verified against Base UI 1.8.0', () => {
    expect(meta).toEqual({
      name: 'OtpField',
      slug: 'otp-field',
      category: 'forms',
      tier: 3,
      status: 'beta',
      rendering: 'client',
      baseUi: 'otp-field',
      baseUiRange: '1.8.0',
      optionalDeps: [],
    })
  })
})
