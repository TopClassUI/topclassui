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
const EXPECTED = ['basic', 'danger-item', 'data-driven', 'groups', 'in-dialog', 'placements', 'rtl', 'sixty-items', 'with-links']

/** The label of each menu trigger a demo serves, every one of them a Button. */
const TRIGGERS: Record<string, string[]> = {
  'basic': ['Actions'],
  'danger-item': ['Project'],
  'data-driven': ['Account'],
  'groups': ['View'],
  // Its menu is inside a dialog, which the server does not render: only the trigger of the dialog is served.
  'in-dialog': [],
  'placements': [
    'top-start', 'top', 'top-end', 'start-top', 'start', 'start-bottom',
    'end-top', 'end', 'end-bottom', 'bottom-start', 'bottom', 'bottom-end',
  ],
  'rtl': ['الإجراءات', 'المزيد'],
  'sixty-items': ['Time zone'],
  'with-links': ['Help'],
}

/** Every other button a demo serves: the one that opens the dialog around a menu. */
const OTHERS: Record<string, string[]> = { 'in-dialog': ['Invite people'] }

/** Anything written as a child of a trigger, which a server-built Button never sees. */
function triggerChildren(source: string): string[] {
  const out: string[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isJsxElement(node) && ['DropdownTrigger', 'DialogTrigger'].includes(node.openingElement.tagName.getText())) {
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
  it('holds exactly the nine demos asked for, so none can be deleted silently', () => {
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
      const label = (button: string) => /<span class="truncate min-w-0">([^<]*)<\/span>/.exec(button)?.[1]
      const buttons = all.filter((button) => button.includes('aria-haspopup="menu"'))
      expect(buttons.map(label), file).toEqual(TRIGGERS[file])
      // Every other button of the page is one the table above names: nothing unlisted is on it.
      expect(all.filter((button) => !buttons.includes(button)).map(label), file).toEqual(OTHERS[file] ?? [])
      for (const button of all) {
        expect(button, file).toContain('aria-expanded="false"')
        expect(button, file).toContain('rounded-control')
        expect(button, file).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
      }
    })

    it(`${file}.tsx renders no menu and no row on the server, because the portal mounts in the browser`, async () => {
      const html = await render(file)
      expect(html, file).not.toContain('role="menu')
      expect(html, file).not.toContain('data-dropdown')
      expect(html, file).not.toContain('role="separator"')
    })

    it(`${file}.tsx serves no anchor and no svg: every row, link and icon is inside the closed menu`, async () => {
      const html = await render(file)
      expect(html.match(/<a[\s>]/g) ?? [], file).toEqual([])
      expect(html.match(/<svg[\s>]/g) ?? [], file).toEqual([])
    })
  }
})

describe('the label of a trigger sits inside the Button passed to render', () => {
  it('in every demo, so a Button a Server Component rendered keeps its truncating span', () => {
    const found = files.flatMap((file) => triggerChildren(readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')))
    expect(found).toEqual([])
  })

  it('the scan sees text, an expression and an element on a trigger, and skips bare line breaks', () => {
    const probe = '<><DropdownTrigger render={<Button />}>Save {n}</DropdownTrigger><DialogTrigger>\n  <Svg icon={x} />\n</DialogTrigger><DropdownItem>Text</DropdownItem></>'
    expect(triggerChildren(probe)).toEqual(['Save', '{n}', '<Svg icon={x} />'])
  })
})

describe('what a demo must not write by hand', () => {
  const sources = files.map((file) => [file, readFileSync(join(DUMMY, `${file}.tsx`), 'utf8')] as const)

  it('no demo writes a tabIndex: Base UI gives the highlighted row the one tab stop', () => {
    expect(sources.filter(([, source]) => /tabIndex/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo writes dir or lang on a part: the positioner takes both from the provider', () => {
    expect(sources.filter(([, source]) => /<Dropdown[A-Za-z]+[^>]*\s(dir|lang)=/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo names a physical side', () => {
    expect(sources.filter(([, source]) => /placement="(left|right)/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('no demo passes onSelect or onClick: a demo is a server file, and a handler needs a client one', () => {
    expect(sources.filter(([, source]) => /onSelect|onClick|onOpenChange/.test(source)).map(([file]) => file)).toEqual([])
  })

  it('the one function a demo passes is declared as a Server Action: async, with the directive first in its body', () => {
    expect(sources.find(([file]) => file === 'data-driven')?.[1]).toContain("async function endSession() {\n  'use server'\n")
    expect(sources.filter(([, source]) => /action[:=]/.test(source)).map(([file]) => file)).toEqual(['data-driven'])
  })
})

describe('the rtl demo is an island', () => {
  it('wraps its triggers in an element that carries the direction and the language', async () => {
    const html = await render('rtl')
    expect(html).toContain('<div dir="rtl" lang="ar" class="flex flex-wrap items-center gap-3"><button ')
  })
})
