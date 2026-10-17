// What e2e/target-size.spec.ts measures (R-5.6-2): every box a pointer or a key can reach.

/**
 * An input both aria-hidden and out of the tab order is Base UI's hidden form input, clipped to 1 px and out of hit
 * testing; an input of type hidden has no box. The three toggle roles are measured whatever element draws them.
 */
export const TARGETS = [
  'button',
  'a[href]',
  '[role="button"]',
  'input:not([type="hidden"]):not([aria-hidden="true"])',
  'input:not([type="hidden"]):not([tabindex="-1"])',
  'select',
  'textarea',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
].join(', ')
