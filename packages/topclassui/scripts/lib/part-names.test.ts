import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  NAMING_EXEMPTIONS, SCROLLING_OVERLAYS, exportsOf, hookFileProblems, libFileProblems, overlayPartProblems,
  partFileProblems, pascalOf,
} from './part-names.js'

const COMPONENTS = join(process.cwd(), 'src', 'components')

describe('reading what a module exports', () => {
  it('tells a function, an arrow, a context, a value and a type apart', () => {
    const source = [
      'export function useA() {}',
      'export const toB = (x: number) => x',
      'export const CContext = createContext(null)',
      'export const DContext = React.createContext(0 as number)',
      'export const table = { a: 1 }',
      'export interface E { a: number }',
      'export type F = string',
      'export class G {}',
    ].join('\n')
    expect(exportsOf(source)).toEqual([
      { name: 'useA', kind: 'function' },
      { name: 'toB', kind: 'function' },
      { name: 'CContext', kind: 'context' },
      { name: 'DContext', kind: 'context' },
      { name: 'table', kind: 'value' },
      { name: 'E', kind: 'type' },
      { name: 'F', kind: 'type' },
      { name: 'G', kind: 'value' },
    ])
  })

  it('sees a re-export, a star, a type-only list and a default export', () => {
    const source = [
      "export { A, type B } from './a.js'",
      "export type { C } from './c.js'",
      "export * from './d.js'",
      'export default function Hidden() {}',
    ].join('\n')
    expect(exportsOf(source)).toEqual([
      { name: 'A', kind: 're-export' },
      { name: 'B', kind: 'type' },
      { name: 'C', kind: 'type' },
      { name: '*', kind: 're-export' },
      { name: 'default', kind: 'default' },
    ])
  })

  it('does not count a declaration that is not exported', () => {
    expect(exportsOf('function a() {}\nconst B = 1\n')).toEqual([])
  })
})

describe('a file in parts/', () => {
  it('names its component after the file', () => {
    expect(pascalOf('dialog-header.tsx')).toBe('DialogHeader')
    expect(pascalOf('date-picker-calendar.tsx')).toBe('DatePickerCalendar')
  })

  it('passes with one function component named after the file', () => {
    expect(partFileProblems('card-body.tsx', 'export function CardBody() { return null }')).toEqual([])
  })

  it('rejects a component named after something else', () => {
    expect(partFileProblems('card-body.tsx', 'export function CardContent() { return null }')).toEqual([
      'does not export CardBody, the name its file gives it.',
    ])
  })

  it('rejects a second export, even a type', () => {
    const source = 'export function CardBody() { return null }\nexport interface CardBodyProps {}'
    expect(partFileProblems('card-body.tsx', source)).toEqual([
      'exports CardBody, CardBodyProps; a part file exports CardBody and nothing else.',
    ])
  })

  it('rejects a file that exports nothing, or a default export', () => {
    expect(partFileProblems('card-body.tsx', 'function CardBody() {}')).toEqual([
      'exports nothing; a part file exports CardBody.',
    ])
    expect(partFileProblems('card-body.tsx', 'export default function CardBody() {}')).toEqual([
      'does not export CardBody, the name its file gives it.',
    ])
  })

  it('rejects the right name holding something that is not a component', () => {
    expect(partFileProblems('card-body.tsx', 'export const CardBody = { a: 1 }')).toEqual([
      'exports CardBody as a value, not a function component.',
    ])
  })
})

describe('hook.ts', () => {
  it('passes hooks and the contexts they read', () => {
    expect(hookFileProblems('export function useA() {}\nexport const AContext = createContext(0)')).toEqual([])
  })

  it('rejects a helper, a table, a type and a re-export', () => {
    const source = [
      'export function toA() {}',
      'export const A = 1',
      'export type B = string',
      "export { useC } from './c.js'",
      'export const NotAContextName = createContext(0)',
    ].join('\n')
    expect(hookFileProblems(source)).toEqual([
      'exports toA (function); hook.ts exports only use* hooks and the contexts they read.',
      'exports A (value); hook.ts exports only use* hooks and the contexts they read.',
      'exports B (type); hook.ts exports only use* hooks and the contexts they read.',
      'exports useC (re-export); hook.ts exports only use* hooks and the contexts they read.',
      'exports NotAContextName (context); hook.ts exports only use* hooks and the contexts they read.',
    ])
  })

  it('rejects a name that only starts with use', () => {
    expect(hookFileProblems('export function user() {}')).toEqual([
      'exports user (function); hook.ts exports only use* hooks and the contexts they read.',
    ])
  })
})

describe('lib.ts', () => {
  it('passes functions and arrow functions', () => {
    expect(libFileProblems('lib.ts', 'export function toA() {}\nexport const toB = () => 1')).toEqual([])
  })

  it('rejects an object, an interface and a context', () => {
    const source = 'export const map = { a: () => 1 }\nexport interface Range {}\nexport const X = createContext(0)'
    expect(libFileProblems('lib.ts', source)).toEqual([
      'exports map (value); lib.ts exports only functions.',
      'exports Range (type); lib.ts exports only functions.',
      'exports X (context); lib.ts exports only functions.',
    ])
  })

  it('lets through the one exempt name and nothing beside it', () => {
    const source = 'export const toast = { add }\nexport const other = { add }'
    expect(libFileProblems('lib.ts', source, ['toast'])).toEqual(['exports other (value); lib.ts exports only functions.'])
  })
})

describe('a scrolling overlay', () => {
  const full = "export { DialogRoot, DialogHeader, DialogBody, DialogFooter, DialogPopup } from './client.js'"

  it('passes with its four parts exported and no parts/ folder', () => {
    expect(overlayPartProblems('dialog', full, null)).toEqual([])
  })

  it('rejects a family with no Body to scroll', () => {
    const source = "export { DialogRoot, DialogHeader, DialogFooter } from './client.js'"
    expect(overlayPartProblems('dialog', source, null)).toEqual([
      'index.tsx does not export DialogBody, a part every scrolling overlay has.',
    ])
  })

  it('rejects a parts/ folder that leaves the footer elsewhere', () => {
    expect(overlayPartProblems('dialog', full, ['dialog-header.tsx', 'dialog-body.tsx'])).toEqual([
      "parts/ has no dialog-footer.tsx; a scrolling overlay's parts folder holds its footer.",
    ])
  })
})

describe('the lists the check reads', () => {
  const folders = readdirSync(COMPONENTS)

  it('names the overlays R-10.5-1 makes scroll a body', () => {
    expect([...SCROLLING_OVERLAYS]).toEqual(['dialog', 'drawer'])
    for (const slug of SCROLLING_OVERLAYS) expect(folders).toContain(slug)
  })

  it('exempts only the toast call object, recorded in docs/DECISIONS.md', () => {
    expect(NAMING_EXEMPTIONS).toEqual({ 'toast/lib.ts': ['toast'] })
  })
})
