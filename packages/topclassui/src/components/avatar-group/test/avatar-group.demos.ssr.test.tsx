import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['counts', 'custom-size', 'four', 'in-table', 'linked', 'many', 'max', 'on-card', 'overflow', 'playground', 'rtl', 'sizes', 'states', 'two']

/** inline-flex and then the focus ring of the library, written out class by class. */
const RINGED_LINK = 'inline-flex outline-none focus-visible:outline-solid focus-visible:outline-(length:--tc-ring-width)'
  + ' focus-visible:outline-offset-(length:--tc-ring-offset) focus-visible:outline-ring'

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
/** How many avatars the demo renders, counters included: each one is a circle of its own.
 * Not the group's `*:rounded-full`, which is one class on the root for all of them. */
const circles = (html: string) => html.match(/(?<![:\w-])rounded-full/g)?.length ?? 0
/** Every circle's opening tag, with the picture laid in it when it has one. */
const avatars = (html: string) =>
  [...html.matchAll(/<span [^>]*class="(?:[^"]* )?rounded-full[^"]*"[^>]*>(<img [^>]*>)?/g)]
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

describe('the demos cover what a real dashboard does to a group', () => {
  it('many: sixty members under max 20, so twenty show and the counter stands for forty', async () => {
    const html = await render('many')
    expect(circles(html)).toBe(21)
    expect(counters(html)).toEqual(['40 more'])
  })

  it('counts: a count of two, three and five digits at each of the five sizes', async () => {
    const html = await render('counts')
    const row = ['99 more', '999 more', '12,345 more']
    expect(counters(html)).toEqual([...row, ...row, ...row, ...row, ...row])
    expect(html).toContain('>+12,345</span>')
  })

  it('linked: every face that shows is the one child of a link, and the links are the children of the group', async () => {
    const html = await render('linked')
    expect(html.match(/<a href="\/people\/[a-z]+" class="[^"]*"><span [^>]*role="img"/g)).toHaveLength(3)
    expect(html).toMatch(/^<span [^>]*role="group"[^>]*><a /)
    expect(counters(html)).toEqual(['2 more'])
  })

  it('linked: every link carries the focus ring of the library, not the one the browser draws', async () => {
    const links = [...(await render('linked')).matchAll(/<a [^>]*>/g)].map((m) => attr(m[0], 'class'))
    expect(links).toEqual([RINGED_LINK, RINGED_LINK, RINGED_LINK])
  })

  it('in-table: teams of 3, 5 and 20, each alone in its cell, beside a count and in a fitted box', async () => {
    const html = await render('in-table')
    expect(groups(html).map((tag) => attr(tag, 'aria-label'))).toEqual([
      'Billing redesign: team', 'Billing redesign: team with a count', 'Billing redesign: team in a box',
      'Mobile onboarding: team', 'Mobile onboarding: team with a count', 'Mobile onboarding: team in a box',
      'Search migration: team', 'Search migration: team with a count', 'Search migration: team in a box',
    ])
    // Three faces, then four and a counter twice: 3 + 5 + 5 circles, in each of the three places.
    expect(circles(html)).toBe(39)
    expect(counters(html)).toEqual(['1 more', '1 more', '1 more', '16 more', '16 more', '16 more'])
    expect(html.match(/<td [^>]*><span [^>]*role="group"/g)).toHaveLength(3)
    expect(html.match(/<td [^>]*><span class="inline-flex items-center gap-2"><span [^>]*role="group"/g)).toHaveLength(3)
    expect(html.match(/<td [^>]*><div class="w-fit [^"]*"><span [^>]*role="group"/g)).toHaveLength(3)
  })

  it('in-table: every group takes the colour of the table for its ring, as on a Card', async () => {
    const tags = groups(await render('in-table'))
    expect(tags).toHaveLength(9)
    for (const tag of tags) {
      expect(attr(tag, 'class'), tag).toContain('*:ring-surface-raised')
      expect(attr(tag, 'class'), tag).not.toContain('*:ring-page')
    }
  })

  it('on-card: the group inside a Card is given the colour of the Card for its ring', async () => {
    const tag = groups(await render('on-card'))[0] ?? ''
    expect(attr(tag, 'class')).toContain('*:ring-surface-raised')
    expect(attr(tag, 'class')).not.toContain('*:ring-page')
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
