import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = [
  'basic', 'dismissible', 'long-action', 'long-text', 'minimal', 'playground', 'rtl', 'states', 'tones', 'with-action',
]

// Rendered here, not inside a test: the first import is cold and can outlast the 5 s timeout.
const HTML = new Map(await Promise.all(files.map(async (file) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return [file, markup(<loaded.default />)] as const
})))

const load = (file: string) => HTML.get(file) ?? ''

/** One chunk per banner in a demo, each starting at its tone. */
const banners = (source: string) => source.split('<div data-tone="').slice(1)

const STATES = ['primary', 'info', 'warning', 'dismissed']

describe('every demo renders on the server', () => {
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx renders at least one banner, and every one is a region`, () => {
      const found = banners(load(file))
      expect(found.length, file).toBeGreaterThan(0)
      expect(found.filter((b) => !/^\w+"[^>]* role="region"/.test(b)), file).toEqual([])
    })

    it(`${file}.tsx names every banner differently, or axe reports two landmarks as one`, () => {
      const names = banners(load(file)).map((b) => /^[^>]* aria-label(?:ledby)?="([^"]*)"/.exec(b)?.[1] ?? '')
      expect(names.filter((name) => name === ''), file).toEqual([])
      expect(new Set(names).size, file).toBe(names.length)
    })

    it(`${file}.tsx has no bare link: an action is a Button, which holds the 24 px target`, () => {
      const links = load(file).match(/<a [^>]*>/g) ?? []
      expect(links.filter((a) => !a.includes('data-variant=')), file).toEqual([])
    })
  }

  it('shows all six tones in the tones demo', () => {
    const tones = banners(load('tones')).map((b) => b.slice(0, b.indexOf('"')))
    expect(tones).toEqual(['primary', 'neutral', 'success', 'warning', 'danger', 'info'])
  })

  it('gives every action the tone of its banner, so its text keeps 4.5:1 on the soft fill', () => {
    const pairs: string[] = []
    for (const file of ['basic', 'long-action', 'long-text', 'rtl', 'with-action']) {
      for (const banner of banners(load(file))) {
        const action = / data-tone="(\w+)"/.exec(banner)?.[1]
        if (action !== undefined) pairs.push(`${file}: ${banner.slice(0, banner.indexOf('"'))}/${action}`)
      }
    }
    expect(pairs).toEqual([
      'basic: info/info', 'long-action: warning/warning', 'long-action: info/info',
      'long-text: warning/warning', 'rtl: info/info',
      'with-action: warning/warning', 'with-action: danger/danger', 'with-action: primary/primary',
    ])
  })
})

describe('the states demo', () => {
  it('is the frame\'s strip: one captioned cell a state', async () => {
    const { default: Demo } = await import('../dummy/states.js') as { default: ComponentType }
    const html = markup(<Demo />)
    const captions = [...html.matchAll(/<div (?:role="(?:group|region)" )?(?:data-tone="\w+" )?[^>]*aria-label="([^"]+)"/g)].map((m) => m[1])
    expect(captions).toEqual(STATES)
  })
})
