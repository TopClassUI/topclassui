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
const EXPECTED = ['basic', 'delays', 'disabled', 'long-label', 'placements', 'playground', 'rtl', 'states', 'with-count']

/** How many triggers each demo holds, every one of them a Button. */
const TRIGGERS: Record<string, number> = {
  'basic': 1,
  'delays': 3,
  'disabled': 1,
  'long-label': 2,
  'placements': 12,
  'playground': 1,
  'rtl': 2,
  'states': 4,
  'with-count': 1,
}

/** The icons each demo draws inside its Buttons, in order, by the start of each path. */
const ICONS: Record<string, string[]> = {
  'basic': ['M165.66,90'],
  'delays': ['M216,32H88', 'M216,48H17', 'M128,80a48'],
  'disabled': ['M227.31,73'],
  'long-label': [],
  'placements': [],
  'playground': ['M165.66,90'],
  'rtl': ['M165.66,90', 'M216,48H17'],
  'states': ['M205.66,11', 'M205.66,14', 'M128,24A10', 'M128,24A10'],
  'with-count': ['M216,48H17'],
}

/** Anything written as a TooltipTrigger child, which a server-built Button never sees. */
function triggerChildren(source: string): string[] {
  const out: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText() === 'TooltipTrigger') {
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
  it('holds exactly the demos PLAN 20 asks for, so none can be deleted silently', () => {
    expect(files).toEqual(EXPECTED)
  })

  for (const file of files) {
    it(`${file}.tsx exports one default demo`, async () => {
      const loaded = await import(`../dummy/${file}.tsx`) as { default?: ComponentType }
      expect(typeof loaded.default, file).toBe('function')
    })

    it(`${file}.tsx renders each trigger as a Button, which brings the ring and the target`, async () => {
      const html = await render(file)
      const buttons = html.match(/<button [^>]*>/g) ?? []
      expect(buttons.length, file).toBe(TRIGGERS[file])
      for (const tag of buttons) {
        expect(tag, file).toContain('data-base-ui-tooltip-trigger=""')
        expect(tag, file).toContain('rounded-control')
        expect(tag, file).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
      }
    })

    it(`${file}.tsx draws each icon inside the Button that names it`, async () => {
      const html = await render(file)
      const buttons = html.match(/<button [^>]*>[\s\S]*?<\/button>/g) ?? []
      const drawn = buttons.flatMap((button) => [...button.matchAll(/<path d="(.{10})/g)].map((m) => m[1]))
      expect(drawn, file).toEqual(ICONS[file])
    })

    it(`${file}.tsx renders no popup on the server, because the portal mounts in the browser`, async () => {
      const html = await render(file)
      expect(html, file).not.toContain('data-placement')
      expect(html, file).not.toContain('bg-neutral-solid')
    })

    it(`${file}.tsx uses no bare anchor or svg outside Svg`, async () => {
      const html = await render(file)
      expect(html.match(/<a[\s>]/g) ?? [], file).toEqual([])
      for (const svg of html.match(/<svg [^>]*>/g) ?? []) expect(svg, file).toContain('aria-hidden="true"')
    })
  }
})

describe("the whole of a trigger's content sits inside the Button passed to render", () => {
  it('in every demo, so a server-built Button keeps its LABEL span and draws an icon beside its spinner', () => {
    const found = files.flatMap((file) => triggerChildren(readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')))
    expect(found).toEqual([])
  })

  it('the scan sees text, an expression and an icon element on the trigger, and skips bare line breaks', () => {
    const probe = '<><TooltipTrigger render={<Button />}>Save {n}</TooltipTrigger><TooltipTrigger>\n  <Svg icon={x} />\n</TooltipTrigger></>'
    expect(triggerChildren(probe)).toEqual(['Save', '{n}', '<Svg icon={x} />'])
  })
})
