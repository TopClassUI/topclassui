import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'form', 'full-width', 'long-content', 'many', 'playground', 'rtl', 'sizes', 'states', 'track-states', 'with-icons']

/** Each track of each demo as the server writes it: its name, then each segment's text, a star on the selected one and a
 * caret on the one tab stop. */
const TRACKS: Record<string, string[]> = {
  'basic': ['View: Board *^ | Table | Calendar'],
  'playground': ['View: Board *^ | Table | Calendar'],
  'form': ['Default view: Board | Table *^ | Calendar'],
  'full-width': ['Range: Day | Week *^ | Month'],
  'long-content': ['Files: Recently opened by anyone in this workspace *^ | Starred | Shared with me'],
  'many': ['Workspace: Overview *^ | Activity log | Team members | Billing and invoices | Integrations | Security settings | Notifications'],
  'rtl': ['طريقة العرض: لوحة | جدول *^ | تقويم'],
  'sizes': ['Extra small: Extra small *^ | Off', 'Small: Small *^ | Off', 'Medium: Medium *^ | Off', 'Large: Large *^ | Off', 'Extra large: Extra large *^ | Off'],
  'states': [
    'idle: A *^ | B', 'hover: A^ | B', 'focus-visible: A^ | B', 'checked: A *^ | B', 'disabled: A | B',
    'invalid: A *^ | B', 'one disabled: A *^ | B | C', 'read-only: A *^ | B',
  ],
  'track-states': [
    'Invalid: Invalid, selected *^ | Invalid', 'Disabled: Disabled, selected *^ | Disabled',
    'One disabled: Live, selected *^ | One disabled | Live', 'Read-only: Read-only, selected *^ | Read-only',
  ],
  'with-icons': ['Theme: Light *^ | Dark | System'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name a screen reader gets with no script, the segments, the selection and the tab stop. */
function tracksIn(html: string): string[] {
  // Base UI writes a state attribute such as data-disabled before the role.
  return html.split(/<div (?=[^>]*role="radiogroup")/).slice(1).map((after) => {
    // A track holds buttons and inputs only, so its first closing div is its own.
    const part = after.slice(0, after.indexOf('</div>'))
    const own = /^[^>]*aria-label="([^"]*)"/.exec(part)?.[1]
    const by = /^[^>]*aria-labelledby="([^"]*)"/.exec(part)?.[1]
    const pointed = by ? new RegExp(`id="${by}"[^>]*>([^<]*)<`).exec(html)?.[1] : undefined
    const items = [...part.matchAll(/<button ([^>]*)>(?:<span class="flex shrink-0"><svg [\s\S]*?<\/svg><\/span>)?<span dir="auto" class="truncate min-w-0">([^<]*)<\/span><\/button>/g)]
      .map(([, button = '', text = '']) => `${text}${button.includes('aria-checked="true"') ? ' *' : ''}${button.includes('tabindex="0"') ? '^' : ''}`)
    return `${own ?? pointed ?? '(no name)'}: ${items.join(' | ')}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the ten demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each track named, each segment named by its text, and one tab stop on the selected segment`, async () => {
      expect(tracksIn(await render(file)), file).toEqual(TRACKS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, nativeButton or render', () => {
    expect(sources.filter(([, source]) => /tabIndex|nativeButton|render=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a segmented control needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: the track carries the name and the default, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toContain('name="view" checked="" value="table"')
  })

  it('basic: a view switch with no name puts no input in a form', async () => {
    expect(await render('basic')).not.toContain('name=')
  })

  it('full-width: the holder and the track fill the box', async () => {
    const html = await render('full-width')
    expect(html).toContain('<div class="grid grid-cols-1 w-full"><div role="radiogroup"')
    expect(html).toMatch(/role="radiogroup"[^>]*class="[^"]* w-full \*:flex-1/)
  })

  it('with-icons: each segment has its icon before its label, hidden from a screen reader', async () => {
    const html = await render('with-icons')
    expect(html.match(/<span class="flex shrink-0"><svg [^>]*aria-hidden="true"/g)).toHaveLength(3)
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
  })

  it('states: the invalid track says so, the disabled one disables every segment, the read-only one says so', async () => {
    const html = await render('states')
    expect(html).toMatch(/<div role="radiogroup" aria-label="invalid" aria-invalid="true"/)
    expect(html).toMatch(/<div data-disabled="" role="radiogroup" aria-disabled="true" aria-label="disabled"/)
    expect(html).toMatch(/<div data-readonly="" role="radiogroup" aria-readonly="true" aria-label="read-only"/)
  })
})
