import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'form', 'rtl', 'sizes', 'states', 'unchecked-value']

/** Each switch of each demo, as the server writes it: its name, by aria-label or by the label that points at its id, and its state. */
const SWITCHES: Record<string, string[]> = {
  'basic': ['Weekly digest: true', 'Email me when I am mentioned: false'],
  'form': ['Weekly digest: true'],
  'rtl': ['الملخص الأسبوعي: true', 'راسلني عند الإشارة إليّ: false'],
  'sizes': ['Extra small: true', 'Small: true', 'Medium: true', 'Large: true', 'Extra large: true'],
  'states': ['Off: false', 'On: true', 'Invalid: false', 'Invalid, on: true', 'Disabled: false', 'Disabled, on: true', 'Read-only: true'],
  'unchecked-value': ['Product news: false'],
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Read out of the HTML itself: a name a screen reader gets with no script, and the state. */
function switchesIn(html: string): string[] {
  return [...html.matchAll(/<button [^>]*role="switch"[^>]*>/g)].map(([button]) => {
    const own = /aria-label="([^"]*)"/.exec(button)?.[1]
    const id = /\bid="([^"]*)"/.exec(button)?.[1]
    const label = id ? new RegExp(`<label for="${id}"[^>]*>([^<]*)</label>`).exec(html)?.[1] : undefined
    return `${own ?? label ?? '(no name)'}: ${/aria-checked="([^"]*)"/.exec(button)?.[1] ?? '?'}`
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the six demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves each switch as a named button with its state`, async () => {
      expect(switchesIn(await render(file)), file).toEqual(SWITCHES[file])
    })
  }
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex, nativeButton or render', () => {
    expect(sources.filter(([, source]) => /tabIndex|nativeButton|render=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a switch needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})

describe('the demos the plan names', () => {
  it('form: one switch that is on, named digest, in a plain form', async () => {
    const html = await render('form')
    expect(html).toMatch(/^<form class="[^"]*">/)
    expect(html).toContain('name="digest" checked=""')
  })

  it('unchecked-value: an off switch with an input of type hidden that sends no', async () => {
    expect(await render('unchecked-value')).toContain('<input type="hidden" name="news" value="no"/>')
  })

  it('rtl: an island that carries the direction and the language', async () => {
    expect(await render('rtl')).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar" class="[^"]*">/)
  })
})
