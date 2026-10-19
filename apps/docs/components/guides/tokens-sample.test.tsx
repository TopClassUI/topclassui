import { describe, expect, it } from 'vitest'

import { excerptOf } from './tokens-sample'

const BLOCK = `[data-theme='dark'] {
  --tc-page: var(--color-neutral-950);
  --tc-body: var(--color-neutral-50);
  /* why */
  --tc-line-strong: var(--color-neutral-400);

  /* mixes */
  --tc-primary-mix: 24%;
  --tc-neutral-mix: 12%;
}`

describe('excerptOf', () => {
  it('keeps the named lines, the comment above each and the gap between groups', () => {
    expect(excerptOf(BLOCK, ['--tc-page', '--tc-line-strong', '--tc-primary-mix'])).toBe(`[data-theme='dark'] {
  --tc-page: var(--color-neutral-950);
  /* why */
  --tc-line-strong: var(--color-neutral-400);

  /* mixes */
  --tc-primary-mix: 24%;
}`)
  })

  it('keeps only the braces when nothing is named', () => {
    expect(excerptOf(BLOCK, [])).toBe(`[data-theme='dark'] {
}`)
  })
})
