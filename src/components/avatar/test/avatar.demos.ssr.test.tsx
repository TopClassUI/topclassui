import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'custom-size', 'icon', 'rtl', 'sizes', 'skeleton', 'with-name']

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

  it('shows a picture in four of them, so the check above is not vacuous', async () => {
    const withImage: string[] = []
    for (const file of files) if ((await render(file)).includes('<img')) withImage.push(file)
    expect(withImage).toEqual(['basic', 'custom-size', 'rtl', 'with-name'])
  })
})
