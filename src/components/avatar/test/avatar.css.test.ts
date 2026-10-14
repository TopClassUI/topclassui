import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { AVATAR_IMAGE } from '../classes.js'

/** What each class of the image must emit, written out: a class Tailwind does not know emits nothing at all. */
const DECLARATION: Record<string, string> = {
  'absolute': 'position: absolute;',
  'inset-0': 'inset: 0px;',
  'size-full': 'width: 100%;',
  'object-cover': 'object-fit: cover;',
  'text-transparent': 'color: transparent;',
  'forced-color-adjust-none': 'forced-color-adjust: none;',
  'data-error:opacity-0': 'opacity: 0%;',
}

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The rule Tailwind emits for one class: from its selector to the first closing brace. */
function ruleFor(css: string, cls: string): string {
  const from = css.indexOf(`.${escape(cls)}`)
  return from === -1 ? '' : css.slice(from, css.indexOf('}', from) + 1)
}

describe('every class of AvatarImage compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of the image', () => {
    expect(AVATAR_IMAGE.split(' ').sort()).toEqual(Object.keys(DECLARATION).sort())
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }

  // Unscoped, every picture would vanish; the attribute is what useAvatarImage writes on a failed one.
  it('data-error:opacity-0 applies only under [data-error]', async () => {
    expect(ruleFor(await css, 'data-error:opacity-0')).toContain('[data-error] {')
  })
})
