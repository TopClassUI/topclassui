import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'form', 'horizontal', 'long-content', 'playground', 'rtl', 'sizes', 'state-matrix', 'states']

/** Each group of each demo as the server writes it: its name, then each radio's text, a star on the checked one and a
 * caret on the one tab stop. */
const GROUPS: Record<string, string[]> = {
  'basic': ['Billing: Monthly | Yearly *^ | Lifetime'],
  'form': ['Plan: Free | Pro *^ | Team'],
  'horizontal': ['Size: Small | Medium *^ | Large | Extra large'],
  'long-content': ['Delivery: Standard delivery *^ | https | Pick up'],
  'playground': ['Billing: Monthly | Yearly *^ | Lifetime'],
  'rtl': ['الفوترة: شهريًا | سنويًا *^ | مدى الحياة'],
  'sizes': ['Extra small: Extra small *^ | Off', 'Small: Small *^ | Off', 'Medium: Medium *^ | Off', 'Large: Large *^ | Off', 'Extra large: Extra large *^ | Off'],
  'state-matrix': [
    'Invalid: Invalid, checked *^ | Invalid', 'Disabled: Disabled, checked *^ | Disabled',
    'One disabled: Live, checked *^ | One disabled | Live', 'Read-only: Read-only, checked *^ | Read-only',
  ],
  'states': ['unselected: ^', 'selected:  *^', 'hover: ^', 'focus-visible: ^', 'disabled: ', 'invalid: ^'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: the name a screen reader gets with no script, the radios, the check and the tab stop. */
function groupsIn(html: string): string[] {
  // Base UI writes a state attribute such as data-disabled before the role.
  return html.split(/<div (?=[^>]*role="radiogroup")/).slice(1).map((part) => {
    const own = /^[^>]*aria-label="([^"]*)"/.exec(part)?.[1]
    const by = /^[^>]*aria-labelledby="([^"]*)"/.exec(part)?.[1]
    const pointed = by ? new RegExp(`id="${by}"[^>]*>([^<]*)<`).exec(html)?.[1] : undefined
    const items = [...part.matchAll(/<label [^>]*><button ([^>]*)>[\s\S]*?<\/button><input [^>]*\/><span [^>]*>([^<]*)<\/span><\/label>/g)]
      .map(([, button = '', text = '']) => {
        // The two long texts of long-content, cut to their first word.
        const word = text.trim().startsWith('https:') ? 'https' : text.trim().replace(/, three [\s\S]*$/, '')
        return `${word}${button.includes('aria-checked="true"') ? ' *' : ''}${button.includes('tabindex="0"') ? '^' : ''}`
      })
    return `${own ?? pointed ?? '(no name)'}: ${items.join(' | ')}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the eight demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each group named, each radio named by its text, and one tab stop on the checked radio`, async () => {
      expect(groupsIn(await render(file)), file).toEqual(GROUPS[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, nativeButton or render', () => {
    expect(sources.filter(([, source]) => /tabIndex|nativeButton|render=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a radio group needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: the group carries the name and the default, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toContain('name="plan" checked="" value="pro"')
  })

  it('playground: the schema props a Try it control sets reach the group', async () => {
    const loaded = await import('../dummy/playground.js') as { default: ComponentType<{ orientation?: string, invalid?: boolean }> }
    const html = markup(<loaded.default orientation="horizontal" invalid />)
    expect(html).toContain('data-orientation="horizontal"')
    expect(html).toContain('aria-invalid="true"')
  })

  it('horizontal: a row that wraps', async () => {
    expect(await render('horizontal')).toMatch(/^<div role="radiogroup" [^>]*data-orientation="horizontal" class="[^"]*flex-row flex-wrap/)
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
  })

  it('state-matrix: the invalid group says so, the disabled group disables every radio, the read-only one says so', async () => {
    const html = await render('state-matrix')
    expect(html).toMatch(/<div role="radiogroup" aria-label="Invalid" aria-invalid="true"/)
    expect(html).toMatch(/<div data-disabled="" role="radiogroup" [^>]*aria-label="Disabled"/)
    expect(html).toMatch(/<div data-disabled="" role="radiogroup" aria-disabled="true"/)
    expect(html).toMatch(/<div data-readonly="" role="radiogroup" aria-readonly="true" aria-label="Read-only"/)
  })
})
