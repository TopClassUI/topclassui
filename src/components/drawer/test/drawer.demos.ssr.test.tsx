import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ComponentType } from 'react'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'

// PLAN 17.1: the demos are the docs code tab and the visual baselines, so each must render.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const files = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

/** Named, or readdirSync shrinks the loop with the folder and a deleted demo is untested. */
const EXPECTED = [
  'bottom', 'end', 'long-body', 'long-content', 'non-modal', 'playground', 'rtl', 'sizes', 'start', 'states', 'top',
  'trap-focus', 'with-form',
]

/** The label of each trigger a demo holds, every one of them a Button. */
const TRIGGERS: Record<string, string[]> = {
  'bottom': ['Country'],
  'end': ['Filters'],
  'long-body': ['Activity'],
  'long-content': ['Move to the archive'],
  'non-modal': ['Outline'],
  'playground': ['Filters'],
  'rtl': ['القائمة', 'التصفية'],
  'sizes': ['xs', 'sm', 'md', 'lg', 'xl', 'custom'],
  'start': ['Menu'],
  'states': ['Side sheet', 'Bottom sheet', 'Scrolled', 'Focus trapped', 'Non-modal'],
  'top': ['What is new'],
  'trap-focus': ['Inspect'],
  'with-form': ['Invite'],
}

/** The two demos that hold a button of the page beside their trigger, to press while the panel is open. */
const BEHIND: Record<string, string[]> = { 'non-modal': ['Behind the panel'], 'trap-focus': ['Behind the panel'] }

/** Anything written as a child of a trigger or a close, which a server-built Button never sees. */
function partChildren(source: string): string[] {
  const out: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isJsxElement(node) && ['DrawerTrigger', 'DrawerClose'].includes(node.openingElement.tagName.getText())) {
      for (const child of node.children) {
        if (!ts.isJsxText(child) || child.text.trim() !== '') out.push(child.getText().trim())
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ts.createSourceFile('demo.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX))
  return out
}

const render = async (file: string) => {
  const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
  const Demo = loaded.default
  return Demo ? markup(<Demo />) : ''
}

describe('every demo renders on the server', () => {
  it('holds exactly the demos the plan asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
    })

    it(`${file}.tsx renders each trigger as a Button with its label in the truncating span`, async () => {
      const html = await render(file)
      const all = html.match(/<button [^>]*>[\s\S]*?<\/button>/g) ?? []
      const label = (button: string) => /<span dir="auto" class="truncate min-w-0">([^<]*)<\/span>/.exec(button)?.[1]
      const buttons = all.filter((button) => button.includes('aria-haspopup="dialog"'))
      expect(buttons.map(label), file).toEqual(TRIGGERS[file])
      // Every other button of the page is one the table above names: nothing unlisted is on it.
      expect(all.filter((button) => !buttons.includes(button)).map(label), file).toEqual(BEHIND[file] ?? [])
      for (const button of buttons) {
        expect(button, file).toContain('aria-expanded="false"')
        expect(button, file).toContain('rounded-control')
        expect(button, file).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
      }
    })

    it(`${file}.tsx renders no popup on the server, because the portal mounts in the browser`, async () => {
      const html = await render(file)
      expect(html, file).not.toContain('role="dialog"')
      expect(html, file).not.toContain('bg-overlay')
      expect(html, file).not.toContain('<h2')
    })

    it(`${file}.tsx uses no bare anchor and no svg outside Svg`, async () => {
      const html = await render(file)
      expect(html.match(/<a[\s>]/g) ?? [], file).toEqual([])
      for (const svg of html.match(/<svg [^>]*>/g) ?? []) expect(svg, file).toContain('aria-hidden="true"')
    })
  }
})

describe('the label of a trigger or a close sits inside the Button passed to render', () => {
  it('in every demo, so a Button a Server Component rendered keeps its truncating span', () => {
    const found = files.flatMap((file) => partChildren(readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')))
    expect(found).toEqual([])
  })

  it('the scan sees text, an expression and an element on a trigger and on a close, and skips bare line breaks', () => {
    const probe = '<><DrawerTrigger render={<Button />}>Save {n}</DrawerTrigger><DrawerClose>\n  <Svg icon={x} />\n</DrawerClose><DrawerBody>Text</DrawerBody></>'
    expect(partChildren(probe)).toEqual(['Save', '{n}', '<Svg icon={x} />'])
  })
})

describe('the rtl demo is an island', () => {
  it('wraps its two triggers in an element that carries the direction and the language', async () => {
    const html = await render('rtl')
    expect(html).toContain('<div dir="rtl" lang="ar" class="flex flex-wrap items-center gap-3"><button ')
  })
})
