import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { blankComments, resolveSpecifier, valueImports } from '../../../../scripts/lib/module-graph.js'
import { hasLateUseClient, hasUseClient, importedModules, importedNames } from '../../../../scripts/lib/source-checks.js'

const ROOT = process.cwd()
const FOLDER = join(import.meta.dirname, '..')
const PART = join(FOLDER, 'parts', 'date-picker-calendar.tsx')
const read = (file: string) => readFileSync(join(FOLDER, file), 'utf8')

/** An import() is loaded when it runs, not with the file, so it is no edge of the static graph. */
const DYNAMIC = /\bimport\s*\(\s*(['"`])[^'"`]+\1\s*\)/g

/** Every file of the folder a file pulls in when it loads, through every file it statically imports. */
function staticFiles(entry: string): string[] {
  const seen = new Set<string>()
  const queue = [entry]
  while (queue.length > 0) {
    const file = queue.pop()
    if (file === undefined || seen.has(file)) continue
    seen.add(file)
    for (const specifier of valueImports(blankComments(readFileSync(file, 'utf8')).replace(DYNAMIC, 'null'))) {
      const target = resolveSpecifier(specifier, file, ROOT)
      if (target !== null) queue.push(target)
    }
  }
  return [...seen].filter((file) => file.startsWith(FOLDER)).map((file) => file.slice(FOLDER.length + 1).replace(/\\/g, '/')).sort()
}

/** The calls that read as hooks, in source order. */
const hookCalls = (source: string) => [...blankComments(source).matchAll(/\buse[A-Z]\w*\(/g)].map((m) => m[0])

describe('the folder holds what DatePicker needs and nothing else (R-8.1-1)', () => {
  it('a hook, a lib and a boundaries file, the calendar in parts/, and no variants or skeleton', () => {
    expect(readdirSync(FOLDER).sort()).toEqual([
      'README.md', 'boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'dummy', 'hook.ts', 'index.tsx', 'lib.ts',
      'meta.ts', 'parts', 'schema.ts', 'test', 'types.ts',
    ])
    expect(readdirSync(join(FOLDER, 'parts'))).toEqual(['date-picker-calendar.tsx'])
  })
})

describe('the calendar is lazy: its markup loads on the first open', () => {
  it('nothing client.tsx loads with the page reaches the part; the hook, the lib and the classes come with the trigger', () => {
    expect(staticFiles(join(FOLDER, 'client.tsx'))).toEqual(['boundaries.ts', 'classes.ts', 'client.tsx', 'constants.ts', 'hook.ts', 'lib.ts'])
  })

  it('client.tsx imports the part only inside lazy(), and renders it in a Suspense with no fallback', () => {
    expect(read('client.tsx')).toContain("lazy(() => import('./parts/date-picker-calendar.js').then((module) => ({ default: module.DatePickerCalendar })))")
    expect(read('client.tsx')).toContain('<Suspense fallback={null}>')
  })

  it('the walk blanks only a dynamic import: the part itself is found from the part', () => {
    expect(staticFiles(PART)).toContain('parts/date-picker-calendar.tsx')
    expect(staticFiles(PART)).toContain('hook.ts')
  })
})

describe('index.tsx re-exports and holds no markup (R-5.1-2)', () => {
  it('has no use client, and is nothing but export-from lines, from client.tsx and types.ts', () => {
    const source = read('index.tsx')
    expect([hasUseClient(source), hasLateUseClient(source)]).toEqual([false, false])
    expect(importedModules(source).sort()).toEqual(['./client.js', './types.js'])
  })
})

describe('client.tsx, the part and hook.ts (R-5.12-1)', () => {
  it("start with 'use client'", () => {
    for (const file of ['client.tsx', 'hook.ts', 'parts/date-picker-calendar.tsx']) expect(read(file).startsWith("'use client'\n"), file).toBe(true)
  })

  it('client.tsx calls one hook and the part one, neither a React state hook itself', () => {
    expect(hookCalls(read('client.tsx'))).toEqual(['useDatePicker('])
    expect(hookCalls(read('parts/date-picker-calendar.tsx'))).toEqual(['useDatePickerCalendar('])
    expect(importedNames(read('client.tsx'), 'react')).toEqual(['lazy', 'Suspense'])
    expect(importedNames(read('parts/date-picker-calendar.tsx'), 'react')).toEqual([])
  })

  it('the trigger takes Base UI\'s popover, the svg and the calendar icon; the part the carets and the x; neither the schema', () => {
    const client = importedModules(read('client.tsx'))
    const part = importedModules(read('parts/date-picker-calendar.tsx'))
    expect(client.filter((m) => m.startsWith('@base-ui/') || m.startsWith('#icons/'))).toEqual(['@base-ui/react/popover', '#icons/data/calendar-blank.js'])
    expect(part.filter((m) => m.startsWith('@base-ui/') || m.startsWith('#icons/'))).toEqual(['@base-ui/react/popover', '#icons/data/caret-left.js', '#icons/data/caret-right.js', '#icons/data/x.js'])
    expect([...client, ...part].filter((m) => m.includes('schema') || m.startsWith('zod'))).toEqual([])
  })

  it('the popup traps the focus with a Close part, opens with no focus of Base UI\'s, and keeps the shared bounds', () => {
    const part = read('parts/date-picker-calendar.tsx')
    expect(read('client.tsx')).toContain('modal="trap-focus"')
    expect(part).toContain('initialFocus={false}')
    expect(part).toContain('sideOffset={POPUP_BOUNDS.sideOffset}')
    expect(part).toContain('collisionPadding={POPUP_BOUNDS.collisionPadding}')
    expect(part).toMatch(/<Base\.Close aria-label=\{calendar\.labels\.close\}/)
  })

  it('the Suspense sits in the Portal around the whole popup, so the popup mounts once, at its full size', () => {
    expect(read('client.tsx')).toMatch(/<Base\.Portal container=\{container\}>\s*\{\/\*[^*]*\*\/\}\s*<Suspense fallback=\{null\}>\s*<DatePickerCalendar/)
    expect(read('client.tsx')).not.toContain('Base.Popup')
    expect(read('parts/date-picker-calendar.tsx')).toMatch(/^ {4}<Base\.Positioner$/m)
  })

  it('hook.ts writes no type argument in angle brackets, and builds on the shared value, scope, labels and locale', () => {
    const source = read('hook.ts')
    expect(source).not.toMatch(/<[A-Za-z]/)
    expect(importedModules(source)).toEqual([
      'react', '#shared/floating.js', '#shared/overlay-scope.js', '#shared/provider/context.js', '#shared/provider/use-portal-locale.js',
      '#shared/use-form-value.js', './lib.js', './types.js',
    ])
  })

  it('lib.ts imports no React', () => {
    expect(importedModules(read('lib.ts')).filter((m) => m.startsWith('react'))).toEqual([])
  })
})

describe('classes.ts builds every string from the shared constants (R-5.2-4)', () => {
  it('takes the field box, the holder, the ring, the popup and the target floor from src/shared, and names no physical side', () => {
    expect(importedNames(read('classes.ts'), '#shared/classes.js')).toEqual(expect.arrayContaining([
      'FIELD_BOX', 'FIELD_HOLDER', 'FOCUS_RING', 'FOCUS_RING_INSET', 'HOVER', 'ICON_BUTTON', 'LABEL', 'OVERLAY_SURFACE',
      'POPUP_MOTION', 'SCROLL_AREA', 'TARGET_HEIGHT', 'TRANSITION',
    ]))
    expect(read('classes.ts')).not.toMatch(/\b(left|right)-|\b[mp][lr]-/)
  })
})
