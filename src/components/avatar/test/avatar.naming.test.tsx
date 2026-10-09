import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { AvatarFallback, AvatarRoot } from '../index.js'

// ARIA prohibits aria-label on a span with no role: axe fails it and a screen reader reads nothing.
describe('a labelled root is an image', () => {
  it('takes role="img" when it is given an aria-label and no role', () => {
    const html = markup(
      <AvatarRoot aria-label="Lina Haddad">
        <AvatarFallback>LH</AvatarFallback>
      </AvatarRoot>,
    )
    expect(html).toMatch(
      /^<span data-size="md" class="[^"]+" role="img" aria-label="Lina Haddad"><span aria-hidden="true" class="[^"]+">LH<\/span><\/span>$/,
    )
  })

  it('takes it for aria-labelledby too, which names it by another element', () => {
    const html = markup(<AvatarRoot aria-labelledby="owner">LH</AvatarRoot>)
    expect(attr(html, 'role')).toBe('img')
    expect(attr(html, 'aria-labelledby')).toBe('owner')
  })

  it('writes the role once, whether the caller or the root supplied it', () => {
    expect(markup(<AvatarRoot aria-label="Lina Haddad" />).split(' role=').length - 1).toBe(1)
    expect(markup(<AvatarRoot role="img" aria-label="Lina Haddad" />).split(' role=').length - 1).toBe(1)
  })
})

describe('the role is only a default', () => {
  it("keeps the caller's own role beside a label", () => {
    expect(attr(markup(<AvatarRoot role="group" aria-label="Lina Haddad" />), 'role')).toBe('group')
    expect(attr(markup(<AvatarRoot role="presentation" aria-labelledby="owner" />), 'role')).toBe('presentation')
  })

  it("keeps the caller's own role with no label at all", () => {
    expect(attr(markup(<AvatarRoot role="presentation" />), 'role')).toBe('presentation')
  })

  it('treats role={undefined} as no role, as a conditional prop passes it', () => {
    expect(attr(markup(<AvatarRoot role={undefined} aria-label="Lina Haddad" />), 'role')).toBe('img')
  })

  it('takes no role with no label, or an image with no name would fail axe instead', () => {
    expect(markup(<AvatarRoot>OA</AvatarRoot>)).not.toContain('role=')
    expect(markup(<AvatarRoot title="Omar">OA</AvatarRoot>)).not.toContain('role=')
  })

  it('takes no role for an empty label, which names nothing', () => {
    expect(markup(<AvatarRoot aria-label="">OA</AvatarRoot>)).not.toContain('role=')
    expect(markup(<AvatarRoot aria-labelledby="">OA</AvatarRoot>)).not.toContain('role=')
  })
})
