import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested (unit-4.md, Demos). */
const EXPECTED = ['basic', 'form-action', 'rtl', 'server-errors']

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

/** Each control of the server HTML: its name, the text of its label, whether it is required and invalid. */
function controlsIn(html: string): string[] {
  return [...html.matchAll(/<(input|textarea) [^>]*>/g)].map(([tag]) => {
    const id = /\bid="([^"]*)"/.exec(tag)?.[1] ?? ''
    const label = new RegExp(`<label [^>]*for="${id}"[^>]*>([^<]*)`).exec(html)?.[1] ?? '(no label)'
    const flags = [/ required=""/.test(tag) ? 'required' : '', /aria-invalid="true"/.test(tag) ? 'invalid' : ''].filter(Boolean)
    return [/name="([^"]*)"/.exec(tag)?.[1], label, ...flags].join(': ')
  })
}

describe('every demo renders on the server', () => {
  it('holds exactly the four demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  it('basic: a form that posts to its own page, with no noValidate and the email required', async () => {
    const html = await render('basic')
    expect(html).toMatch(/^<form class="[^"]*" action="\?subscribed" method="post">/)
    expect(html).not.toMatch(/novalidate/i)
    expect(controlsIn(html)).toEqual(['email: Email: required'])
  })

  it('server-errors: an Input and a Textarea, each named, each invalid, posting to its own page', async () => {
    const html = await render('server-errors')
    expect(html).toMatch(/^<form class="[^"]*" action="\?sent" method="post">/)
    expect(controlsIn(html)).toEqual(['email: Email: required: invalid', 'message: Message: invalid'])
  })

  it('rtl: the subscribe form in Arabic, inside an island that carries the direction and the language', async () => {
    const html = await render('rtl')
    expect(html).toMatch(/^<div class="isolate"><div dir="rtl" lang="ar"><form class="[^"]*" action="\?subscribed" method="post">/)
    expect(controlsIn(html)).toEqual(['name: الاسم', 'email: البريد الإلكتروني: required'])
  })

  it('form-action: the same fields in the server HTML, none invalid yet, and no aria-busy', async () => {
    const html = await render('form-action')
    expect(html).toMatch(/^<form class="[^"]*" action="javascript:throw/)
    expect(html).not.toContain(' aria-busy=')
    expect(controlsIn(html)).toEqual(['name: Name', 'email: Email: required'])
  })
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex', () => {
    expect(sources.filter(([, source]) => /tabIndex/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('only form-action is a client file: a server Form needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual(['form-action'])
  })

  it('no control is named reset or submit, which would hide form.reset or form.submit', () => {
    expect(sources.filter(([, source]) => /(id|name)="(reset|submit)"/.test(source)).map(([file]) => file)).toEqual([])
  })
})
