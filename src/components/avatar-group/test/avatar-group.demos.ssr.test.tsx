import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['custom-size', 'four', 'max', 'overflow', 'rtl', 'sizes', 'two']

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

/** Every group's opening tag, so each one is checked rather than the first. */
const groups = (html: string) => [...html.matchAll(/<span [^>]*role="group"[^>]*>/g)].map((m) => m[0])
/** The name of every counter, in order: the one img whose text is pinned left to right. */
const counters = (html: string) =>
  [...html.matchAll(/<span [^>]*role="img"[^>]*>(?=<span [^>]*dir="ltr")/g)].map((m) => attr(m[0], 'aria-label'))
/** How many avatars the demo renders, counters included: each one is a circle. */
const circles = (html: string) => html.split('rounded-full').length - 1
/** Every circle's opening tag, with the picture laid in it when it has one. */
const avatars = (html: string) =>
  [...html.matchAll(/<span [^>]*class="[^"]*rounded-full[^"]*"[^>]*>(<img [^>]*>)?/g)]
    .map((m) => ({ root: m[0].replace(m[1] ?? '', ''), image: m[1] }))

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo that renders a group of avatars`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
      const html = await render(file)
      // Not toContain('<'): an empty span passes that.
      expect(groups(html).length, file).toBeGreaterThan(0)
      expect(circles(html), file).toBeGreaterThan(1)
    })

    it(`${file}.tsx names every group, so the row is announced as more than "group"`, async () => {
      for (const tag of groups(await render(file))) {
        expect((attr(tag, 'aria-label') ?? '').trim(), `${file}: ${tag}`).not.toBe('')
      }
    })

    it(`${file}.tsx names every avatar: the alt of its picture, or role img and aria-label`, async () => {
      const found = avatars(await render(file))
      expect(found.length, file).toBeGreaterThan(1)
      for (const { root, image } of found) {
        const name = image === undefined ? attr(root, 'aria-label') : attr(image, 'alt')
        expect((name ?? '').trim(), `${file}: ${root}`).not.toBe('')
        if (image === undefined) expect(attr(root, 'role'), `${file}: ${root}`).toBe('img')
      }
    })
  }
})

describe('the demos cover the three states the site draws', () => {
  it('two: both show and nothing is counted', async () => {
    const html = await render('two')
    expect(circles(html)).toBe(2)
    expect(counters(html)).toEqual([])
  })

  it('four: exactly max, so all four show and nothing is counted', async () => {
    const html = await render('four')
    expect(circles(html)).toBe(4)
    expect(counters(html)).toEqual([])
  })

  it('overflow: four avatars and then +9', async () => {
    const html = await render('overflow')
    expect(circles(html)).toBe(5)
    expect(counters(html)).toEqual(['9 more'])
    expect(html).toContain('>+9</span>')
  })

  it('max: the docs sample, three children under max 2', async () => {
    const html = await render('max')
    expect(circles(html)).toBe(3)
    expect(counters(html)).toEqual(['1 more'])
    expect(html).toContain('>+1</span>')
  })
})

describe('the demos cover what PLAN 20 asks for', () => {
  const all = async () => (await Promise.all(EXPECTED.map(render))).join('')

  it('shows every size, on the group and on its counter', async () => {
    const html = await all()
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', 'custom']) {
      expect(html, size).toContain(`role="group" data-size="${size}"`)
    }
    const sizes = await render('sizes')
    for (const box of ['size-control-xs', 'size-control-sm', 'size-control-md', 'size-control-lg', 'size-control-xl']) {
      // Three avatars and the counter in each row.
      expect(sizes.split(box).length - 1, box).toBe(4)
    }
  })

  it('sizes the custom demo from the group, since custom emits no box', async () => {
    const html = await render('custom-size')
    expect(html).not.toContain('size-control-')
    expect(attr(groups(html)[0] ?? '', 'class')).toContain('*:size-16')
  })

  it('renders the right-to-left demo inside dir="rtl", named in Arabic', async () => {
    const html = await render('rtl')
    expect(html).toMatch(/^<div dir="rtl" lang="ar"/)
    expect(counters(html)).toEqual(['3 آخرون'])
    expect(html).toContain('dir="ltr">+3</span>')
  })

  it('shows a picture under the ring as well as initials', async () => {
    expect(await render('four')).toContain('<img ')
  })
})
