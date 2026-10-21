import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'custom-size', 'failed', 'icon', 'playground', 'rtl', 'sizes', 'skeleton', 'states', 'with-name']

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
      // Not toContain('<'): an empty div passes that, and an avatar and its skeleton are both the circle.
      expect(await render(file), file).toContain('rounded-full')
    })

    it(`${file}.tsx gives every img an alt and an inline source, so no demo reaches the network`, async () => {
      const images = (await render(file)).match(/<img[^>]*>/g) ?? []
      for (const image of images) {
        expect(image, file).toMatch(/ alt="[^"]*"/)
        expect(image, file).toMatch(/ src="data:image\/svg\+xml,/)
      }
    })
  }

  it('shows a picture in seven of them, so the check above is not vacuous', async () => {
    const withImage: string[] = []
    for (const file of files) if ((await render(file)).includes('<img')) withImage.push(file)
    expect(withImage).toEqual(['basic', 'custom-size', 'failed', 'playground', 'rtl', 'states', 'with-name'])
  })

  it('writes no role in any of them: every role="img" counted below is one the root gave itself', () => {
    for (const file of files) expect(readFileSync(join(DUMMY, `${file}.tsx`), 'utf8'), file).not.toMatch(/<AvatarRoot[^>]* role=/)
  })
})

/** Per demo: fallbacks rendered, roots named with role="img", and pictures named by a non-empty alt. */
const NAMING: Record<string, { fallbacks: number; namedRoots: number; namedImages: number }> = {
  'basic': { fallbacks: 2, namedRoots: 1, namedImages: 1 },
  'custom-size': { fallbacks: 2, namedRoots: 1, namedImages: 1 },
  // Five sizes of one picture that fails: its alt still names each, though none of it is painted.
  'failed': { fallbacks: 5, namedRoots: 0, namedImages: 5 },
  'icon': { fallbacks: 3, namedRoots: 3, namedImages: 0 },
  'playground': { fallbacks: 1, namedRoots: 0, namedImages: 1 },
  // The names are written beside both avatars, so neither adds a second one.
  'rtl': { fallbacks: 2, namedRoots: 0, namedImages: 0 },
  'sizes': { fallbacks: 5, namedRoots: 5, namedImages: 0 },
  'skeleton': { fallbacks: 5, namedRoots: 5, namedImages: 0 },
  // A picture, initials, an icon, a picture that failed, and a skeleton, which has no fallback.
  'states': { fallbacks: 3, namedRoots: 2, namedImages: 1 },
  'with-name': { fallbacks: 1, namedRoots: 0, namedImages: 0 },
}

const count = (html: string, pattern: RegExp) => (html.match(pattern) ?? []).length

describe('every demo names each avatar once', () => {
  it('lists every demo, so a new one cannot skip the check', () => {
    expect(Object.keys(NAMING).sort()).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx hides every fallback and never un-hides one`, async () => {
      const html = await render(file)
      expect(count(html, /<span aria-hidden="true" class="inline-flex items-center justify-center">/g), file)
        .toBe(NAMING[file]?.fallbacks)
      expect(html, file).not.toContain('aria-hidden="false"')
    })

    it(`${file}.tsx names an avatar on its root or by its alt, as often as written here`, async () => {
      const html = await render(file)
      expect(count(html, /<span data-size="[a-z]+" class="[^"]+" role="img" aria-label="[^"]+">/g), file)
        .toBe(NAMING[file]?.namedRoots)
      expect(count(html, /<img alt="[^"]+"/g), file).toBe(NAMING[file]?.namedImages)
    })
  }
})
