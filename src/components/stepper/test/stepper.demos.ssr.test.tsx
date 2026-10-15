import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['arabic-digits', 'basic', 'long-content', 'rtl', 'sizes', 'statuses']

const render = async (file: string) => markup(createDemo((await import(`../dummy/${file}.tsx`) as { default: ComponentType }).default))
const createDemo = (Demo: ComponentType) => <Demo />
/** Every list's opening tag, so each one is checked rather than the first. */
const lists = (html: string) => [...html.matchAll(/<ol [^>]*>/g)].map((m) => m[0])
const statuses = (html: string) => [...html.matchAll(/data-status="(\w+)"/g)].map((m) => m[1])
/** What each circle holds as text: the number, or nothing for a tick and an x. */
const numbers = (html: string) => [...html.matchAll(/<span aria-hidden="true" class="relative inline-flex[^"]*">([^<]*)/g)].map((m) => m[1])

describe('every demo renders on the server', () => {
  it('holds exactly the demos unit-5.md asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of EXPECTED) {
    it(`${file}.tsx renders at least one named list with the list role written`, async () => {
      const found = lists(await render(file))
      expect(found.length, file).toBeGreaterThan(0)
      for (const tag of found) {
        expect(attr(tag, 'role'), file).toBe('list')
        expect(attr(tag, 'aria-label')?.trim(), file).toBeTruthy()
      }
    })
  }

  it('basic: four steps, the second current, as drawn', async () => {
    const out = await render('basic')
    expect(statuses(out)).toEqual(['done', 'current', 'todo', 'todo'])
    expect(numbers(out)).toEqual(['', '2', '3', '4'])
  })

  it('statuses: all four, the error one its own', async () => {
    expect(statuses(await render('statuses'))).toEqual(['done', 'error', 'current', 'todo'])
  })

  it('sizes: the five sizes in order', async () => {
    expect(lists(await render('sizes')).map((tag) => attr(tag, 'data-size'))).toEqual(['xs', 'sm', 'md', 'lg', 'xl'])
  })

  it('arabic-digits: Arabic-Indic numbers in the first, Latin in the second, the words in Arabic', async () => {
    const out = await render('arabic-digits')
    expect(numbers(out)).toEqual(['', '', '٣', '٤', '', '', '3', '4'])
    expect(out).toContain('<span class="sr-only">مكتمل</span>')
  })

  it('rtl: the direction is set on a wrapper inside the provider, and the words are Arabic', async () => {
    const out = await render('rtl')
    expect(out).toContain('<div dir="rtl" lang="ar"><ol ')
    expect([...out.matchAll(/<span class="sr-only">([^<]*)<\/span>/g)].map((m) => m[1])).toEqual(['مكتمل', 'لم يبدأ', 'لم يبدأ'])
  })

  it('long-content: six steps whose titles are forty characters each', async () => {
    const out = await render('long-content')
    const titles = [...out.matchAll(/<span dir="auto" class="[^"]*">([^<]*)<\/span>/g)].map((m) => m[1]?.length)
    expect(titles).toEqual([40, 40, 40, 40, 40, 40])
  })
})
