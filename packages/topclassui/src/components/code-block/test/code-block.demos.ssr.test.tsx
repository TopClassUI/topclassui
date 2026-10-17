import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = ['basic', 'highlighted', 'long-line', 'no-copy', 'no-header', 'rtl', 'wrap']

/** Each demo as the server writes it: the title, the button's own name, whether the pre is a tab stop and a region. */
const SHAPE: Record<string, { title: string | null, button: string | null, tabStop: boolean, region: boolean }> = {
  'basic': { title: 'page.tsx', button: 'Copy', tabStop: true, region: true },
  'highlighted': { title: 'sample.tsx', button: 'Copy', tabStop: true, region: true },
  'long-line': { title: 'token.ts', button: 'Copy', tabStop: true, region: true },
  'no-copy': { title: 'globals.css', button: null, tabStop: true, region: true },
  'no-header': { title: null, button: null, tabStop: true, region: true },
  'rtl': { title: 'الفواتير.tsx', button: 'نسخ', tabStop: true, region: true },
  'wrap': { title: 'invoice-row.tsx', button: 'Copy', tabStop: false, region: true },
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default: ComponentType }
  return markup(<loaded.default />)
}

const shapeOf = (html: string) => {
  const pre = /<pre [^>]*>/.exec(html)?.[0] ?? ''
  return {
    title: /<span dir="auto" id="[^"]+"[^>]*>([^<]*)<\/span>/.exec(html)?.[1] ?? null,
    button: /<button [^>]*aria-label="([^"]*)"/.exec(html)?.[1] ?? null,
    tabStop: pre.includes('tabindex="0"'),
    region: pre.includes('role="region"'),
  }
}

/** The code as a reader copies it: the text of the code element with the markup and its escapes taken out. */
const codeText = (html: string) => (/<code>([\s\S]*)<\/code>/.exec(html)?.[1] ?? '')
  .replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')

describe('every demo renders on the server', () => {
  it('holds exactly the seven demos asked for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx serves its title, its button and its pre as the plan names them`, async () => {
      expect(shapeOf(await render(file)), file).toEqual(SHAPE[file])
    })
  }
})

describe('the demos the plan names', () => {
  it('basic: the sample of the card, with its line breaks and indent', async () => {
    expect(codeText(await render('basic'))).toBe('export default async function Page() {\n  const invoices = await getInvoices()\n  return <InvoiceTable items={invoices} />\n}')
  })

  it('long-line: one line of exactly 300 characters', async () => {
    const text = codeText(await render('long-line'))
    expect(text.length).toBe(300)
    expect(text).not.toContain('\n')
  })

  it('highlighted: the coloured nodes read as the same text the button copies', async () => {
    const html = await render('highlighted')
    expect(html).toContain('<span class="font-semibold">import</span>')
    expect(codeText(html)).toBe("import { CodeBlock } from 'topclassui/code-block'\n\n// Coloured by the caller, copied as plain text\nexport const sample = <CodeBlock title=\"page.tsx\">{code}</CodeBlock>")
  })

  it('rtl: the page is right to left, and the code is not', async () => {
    const html = await render('rtl')
    expect(html).toContain('<div dir="rtl" lang="ar">')
    expect(html).toContain('<pre dir="ltr"')
  })
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex', () => {
    expect(sources.filter(([, source]) => /tabIndex/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo is a client file: a code block needs no state of the page', () => {
    expect(sources.filter(([, source]) => source.startsWith("'use client'")).map(([file]) => file)).toEqual([])
  })
})
