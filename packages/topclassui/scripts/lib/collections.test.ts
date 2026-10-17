import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  COLLECTION_EXEMPT, callsUseCollection, collectionErrors, rendersItems, takesCollectionProps, takesListRows, takesLoadMore,
} from './collections.js'

const COMPONENTS = join(process.cwd(), 'src', 'components')

const read = (slug: string, file: string) => {
  try { return readFileSync(join(COMPONENTS, slug, file), 'utf8') } catch { return null }
}

const HOOK = [
  "import { useCollection } from '#shared/collection/use-collection.js'",
  'export function useList(props) { return useCollection({ items: props.items, getKey: (item) => item.id }) }',
].join('\n')

const ITEMS = 'export interface ListProps {\n  items: readonly Row[]\n}\n'

describe('rendersItems', () => {
  it('sees an items prop, optional or readonly', () => {
    expect(rendersItems(ITEMS)).toBe(true)
    expect(rendersItems('type P = {\n  items?: Row[]\n}')).toBe(true)
    expect(rendersItems('type P = {\n  readonly items: Row[]\n}')).toBe(true)
  })

  it('sees the shared contract and the menu contract', () => {
    expect(rendersItems("type P = Pick<CollectionProps<T>, 'items'>")).toBe(true)
    expect(rendersItems('type P = MenuContract & Own')).toBe(true)
  })

  it('ignores items in a comment, and a prop that only ends in items', () => {
    expect(rendersItems('/** the items: every row */\n// items: none\ntype P = { value: string }')).toBe(false)
    expect(rendersItems('type P = {\n  menuItems: Row[]\n}')).toBe(false)
  })
})

describe('takesListRows', () => {
  it('sees a list by its knob, whatever its items are called: a visibleRows prop, or --tc-list-rows in the code', () => {
    expect(takesListRows('export interface P {\n  visibleRows: number | undefined\n}')).toBe(true)
    expect(takesListRows("const LIST = 'max-h-[calc(var(--tc-list-rows)*2rem)]'")).toBe(true)
    expect(takesListRows("<ul style={{ '--tc-list-rows': rows }} />")).toBe(true)
  })

  it('ignores the knob named in a comment, and a prop that only ends in visibleRows', () => {
    expect(takesListRows('/** shows about --tc-list-rows rows */\n// visibleRows: 7\nconst A = 1')).toBe(false)
    expect(takesListRows('type P = {\n  maxVisibleRows: number\n}')).toBe(false)
  })
})

describe('takesCollectionProps and takesLoadMore', () => {
  it('a pick of the contract is still the contract, and takes loadMore only when it picks it', () => {
    expect(takesCollectionProps("type P = Pick<CollectionProps<T>, 'items' | 'getKey'>")).toBe(true)
    expect(takesLoadMore("type P = Pick<CollectionProps<T>, 'items' | 'getKey'>")).toBe(false)
    expect(takesLoadMore("type P = Pick<CollectionProps<T>, 'items' | 'loadMore'>")).toBe(true)
  })

  it('the whole contract and a declared loadMore both take it', () => {
    expect(takesLoadMore('interface P extends CollectionProps<Row> {}')).toBe(true)
    expect(takesLoadMore('type P = {\n  loadMore?: (() => void) | undefined\n}')).toBe(true)
    expect(takesLoadMore(ITEMS)).toBe(false)
  })

  it('an import names the contract without taking it', () => {
    const picked = "import type { CollectionProps } from '#shared/contracts/collection.js'\ntype P = Pick<CollectionProps<T>, 'items'>"
    expect(takesLoadMore(picked)).toBe(false)
    expect(takesCollectionProps("import type {\n  CollectionProps,\n} from '#shared/contracts/collection.js'\ntype P = { value: string }")).toBe(false)
  })
})

describe('callsUseCollection', () => {
  it('needs the shared import and a call', () => {
    expect(callsUseCollection(HOOK)).toBe(true)
    expect(callsUseCollection("import { useCollection } from '#shared/collection/use-collection.js'\n")).toBe(false)
    expect(callsUseCollection('const rows = useCollection({ items })\n')).toBe(false)
  })

  it('takes a relative import and a type argument', () => {
    expect(callsUseCollection("import { useCollection } from '../../shared/collection/use-collection.js'\nuseCollection<Row>({})")).toBe(true)
  })

  it('does not count a call that is commented out, or a hook of another name', () => {
    expect(callsUseCollection("import { useCollection } from '#shared/collection/use-collection.js'\n// useCollection({ items })\n")).toBe(false)
    expect(callsUseCollection("import { useCollectionDefaults } from '#shared/provider/context.js'\nuseCollectionDefaults()")).toBe(false)
  })
})

describe('collectionErrors', () => {
  it('rejects a list whose hook renders every item by hand', () => {
    const hook = 'export function useList(props) { return { rows: props.items } }'
    expect(collectionErrors({ slug: 'list', types: ITEMS, hook })).toEqual(['renders items and its hook.ts never calls useCollection'])
  })

  it('rejects a list with no hook at all', () => {
    expect(collectionErrors({ slug: 'list', types: ITEMS, hook: null })).toEqual(['renders items and has no hook.ts to call useCollection in'])
  })

  it('passes a list that windows through useCollection, and a component with no items', () => {
    expect(collectionErrors({ slug: 'list', types: ITEMS, hook: HOOK })).toEqual([])
    expect(collectionErrors({ slug: 'badge', types: 'type P = { tone: Tone }', hook: null })).toEqual([])
    expect(collectionErrors({ slug: 'kbd', types: null, hook: null })).toEqual([])
  })

  it('an exemption never covers props that take CollectionProps', () => {
    const types = "type P = Pick<CollectionProps<T>, 'items'>"
    expect(collectionErrors({ slug: 'list', types, hook: null }, { list: 'a reason' })).toEqual(['its props take CollectionProps, which no exemption covers'])
  })

  it('rejects a list found only by its knob, as a file list that renders File rows with no items prop', () => {
    const types = 'export interface UploadState {\n  visibleRows: number | undefined\n}'
    const hook = 'export function useUpload() { return { rows: [] } }'
    expect(collectionErrors({ slug: 'upload', types, hook })).toEqual(['renders items and its hook.ts never calls useCollection'])
    expect(collectionErrors({ slug: 'upload', types: 'type P = {}', hook, rest: "const L = 'max-h-(--tc-list-rows)'" }))
      .toEqual(['renders items and its hook.ts never calls useCollection'])
  })

  it('an exemption that no longer holds is an error, so the table cannot grow stale', () => {
    expect(collectionErrors({ slug: 'list', types: ITEMS, hook: HOOK }, { list: 'a reason' })).toEqual(['calls useCollection and is still exempt; remove it from COLLECTION_EXEMPT'])
    expect(collectionErrors({ slug: 'list', types: 'type P = {}', hook: null }, { list: 'a reason' })).toEqual(['renders no items and is still exempt; remove it from COLLECTION_EXEMPT'])
    expect(collectionErrors({ slug: 'list', types: ITEMS, hook: null }, { list: 'a reason' })).toEqual([])
  })
})

describe('the components in src', () => {
  const slugs = readdirSync(COMPONENTS, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  const rest = (slug: string) => ['schema.ts', 'classes.ts', 'client.tsx'].map((file) => read(slug, file) ?? '').join('\n')
  const folder = (slug: string) => ({ slug, types: read(slug, 'types.ts'), hook: read(slug, 'hook.ts'), rest: rest(slug) })

  it('the six collections call useCollection in their hook', () => {
    const windowed = slugs.filter((slug) => callsUseCollection(read(slug, 'hook.ts') ?? '')).sort()
    expect(windowed).toEqual(['combobox', 'command', 'file-upload', 'select', 'table', 'tree-view'])
  })

  it('every component that renders items is windowed or exempt by name', () => {
    const rendering = slugs.filter((slug) => rendersItems(read(slug, 'types.ts') ?? '')).sort()
    expect(rendering).toEqual(['breadcrumb', 'combobox', 'command', 'dropdown', 'select', 'stepper', 'table', 'timeline', 'tree-view'])
    const byKnob = slugs.filter((slug) => !rendering.includes(slug) && takesListRows(`${read(slug, 'types.ts') ?? ''}\n${rest(slug)}`))
    expect(byKnob).toEqual(['file-upload'])
    expect(Object.keys(COLLECTION_EXEMPT).sort()).toEqual(['breadcrumb', 'dropdown', 'stepper', 'timeline'])
  })

  it('no folder breaks the rule', () => {
    expect(slugs.flatMap((slug) => collectionErrors(folder(slug)).map((error) => `${slug}: ${error}`))).toEqual([])
  })

  it('a collection that took the contract and dropped useCollection would fail', () => {
    const broken = { ...folder('command'), hook: (read('command', 'hook.ts') ?? '').replace(/useCollection\(/g, 'useRows(') }
    expect(collectionErrors(broken)).toEqual(['renders items and its hook.ts never calls useCollection'])
  })

  it('the file list, which has no items prop, would fail the same way without useCollection', () => {
    const broken = { ...folder('file-upload'), hook: (read('file-upload', 'hook.ts') ?? '').replace(/useCollection\(/g, 'useRows(') }
    expect(collectionErrors(broken)).toEqual(['renders items and its hook.ts never calls useCollection'])
  })
})
