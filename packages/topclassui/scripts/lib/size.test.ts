import { describe, expect, it } from 'vitest'

import {
  type BudgetFile, type Outputs, type SizeFile, budgetProblems, closureOf, entriesBySlug, formatKb, ownSizes, runtimeChunkOf, staleProblems,
} from './size.js'

const statically = (path: string) => ({ path, kind: 'import-statement' })
const outputs: Outputs = {
  'size-out/switch.js': {
    entryPoint: 'dist/components/switch/client.js',
    imports: [statically('size-out/chunk-cn.js'), statically('size-out/chunk-classes.js'), { path: 'react', kind: 'import-statement', external: true }],
    inputs: {},
  },
  'size-out/command.js': {
    entryPoint: 'dist/components/command/client.js',
    imports: [statically('size-out/chunk-classes.js'), { path: 'size-out/panel.js', kind: 'dynamic-import' }],
    inputs: {},
  },
  'size-out/panel.js': { imports: [statically('size-out/chunk-cn.js'), statically('size-out/chunk-list.js')], inputs: {} },
  'size-out/chunk-cn.js': { imports: [], inputs: { 'dist/shared/cn.js': {}, 'node_modules/tailwind-merge/dist/bundle-mjs.mjs': {} } },
  'size-out/chunk-classes.js': { imports: [], inputs: { 'dist/shared/classes.js': {} } },
  'size-out/chunk-list.js': { imports: [], inputs: {} },
}
const GZIPPED: Record<string, number> = {
  'size-out/switch.js': 1000,
  'size-out/command.js': 500,
  'size-out/panel.js': 3000,
  'size-out/chunk-cn.js': 9000,
  'size-out/chunk-classes.js': 2000,
  'size-out/chunk-list.js': 700,
}
const gzipped = (path: string) => GZIPPED[path] ?? 0

describe('closureOf', () => {
  it('follows static imports for the eager part and leaves out the externals', () => {
    expect(closureOf(outputs, 'size-out/switch.js')).toEqual({
      eager: ['size-out/chunk-classes.js', 'size-out/chunk-cn.js', 'size-out/switch.js'],
      lazy: [],
    })
  })

  it('puts a dynamic import and what only it loads in the lazy part', () => {
    expect(closureOf(outputs, 'size-out/command.js')).toEqual({
      eager: ['size-out/chunk-classes.js', 'size-out/command.js'],
      lazy: ['size-out/chunk-cn.js', 'size-out/chunk-list.js', 'size-out/panel.js'],
    })
  })
})

describe('the entries and the runtime chunk', () => {
  it('keys each entry by the slug of its client.js', () => {
    expect([...entriesBySlug(outputs)]).toEqual([['switch', 'size-out/switch.js'], ['command', 'size-out/command.js']])
  })

  it('finds the chunk that holds cn', () => {
    expect(runtimeChunkOf(outputs)).toBe('size-out/chunk-cn.js')
    expect(runtimeChunkOf({})).toBeNull()
  })
})

describe('ownSizes', () => {
  it('sums the gzipped chunks and takes the runtime out of the budgeted number only when the entry loads it at once', () => {
    expect(Object.fromEntries(ownSizes(outputs, gzipped))).toEqual({
      switch: { clientBytes: 12000, lazyBytes: 0, budgetedBytes: 3000 },
      command: { clientBytes: 2500, lazyBytes: 12700, budgetedBytes: 2500 },
    })
  })
})

describe('formatKb', () => {
  it('prints one decimal of 1024 bytes', () => {
    expect(formatKb(4915)).toBe('4.8 KB')
    expect(formatKb(0)).toBe('0.0 KB')
    expect(formatKb(2150)).toBe('2.1 KB')
  })
})

const size = (budgetedBytes: number, lazyBytes = 0) => ({ clientBytes: budgetedBytes + 9000, lazyBytes, withBaseUiBytes: budgetedBytes + 40000, budgetedBytes })
const file = (components: SizeFile['components']): SizeFile => ({ tool: 'esbuild', runtimeBytes: 9000, components })
const budget: BudgetFile = {
  kb: { simple: 6, overlay: 14, lazy: 6 },
  components: { switch: 'simple', dialog: 'overlay', command: 'lazy', tree: { class: 'simple', kb: 11.4 } },
}

describe('budgetProblems', () => {
  it('passes every component at or under its budget', () => {
    expect(budgetProblems(file({ switch: size(6144), dialog: size(14336), command: size(6000, 14000), tree: size(11674) }), budget)).toEqual([])
  })

  it('names a component one byte over, a raised budget included', () => {
    expect(budgetProblems(file({ switch: size(6145), dialog: size(14337), command: size(10, 1), tree: size(11675) }), budget)).toEqual([
      'switch: 6145 bytes is over its budget of 6144 (6.0 KB)',
      'dialog: 14337 bytes is over its budget of 14336 (14.0 KB)',
      'tree: 11675 bytes is over its budget of 11674 (11.4 KB)',
    ])
  })

  it('names a lazy component that loads nothing on demand, a component with no budget and a budget with no component', () => {
    expect(budgetProblems(file({ command: size(10), switch: size(10), dialog: size(10), tree: size(10), extra: size(10) }), budget)).toEqual([
      'command: budgeted as lazy, but it loads no chunk on demand',
      'extra: no budget in size-budget.json',
    ])
    expect(budgetProblems(file({ switch: size(10) }), budget)).toEqual([
      'dialog: in size-budget.json, but it has no client.js',
      'command: in size-budget.json, but it has no client.js',
      'tree: in size-budget.json, but it has no client.js',
    ])
  })
})

describe('staleProblems', () => {
  it('ignores a move of 64 bytes or less, which a different zlib may make', () => {
    expect(staleProblems(file({ switch: size(5000) }), file({ switch: size(5064) }))).toEqual([])
  })

  it('names a move of 65 bytes, a moved runtime, and a component added or removed', () => {
    const fresh = { ...file({ switch: size(5065), added: size(1) }), runtimeBytes: 9100 }
    expect(staleProblems(file({ switch: size(5000), old: size(1) }), fresh)).toEqual([
      'runtimeBytes is 9100, size.json says 9000',
      'added: missing from size.json',
      'old: no longer measured but still in size.json',
      'switch: clientBytes is 14065, size.json says 14000',
      'switch: withBaseUiBytes is 45065, size.json says 45000',
      'switch: budgetedBytes is 5065, size.json says 5000',
    ])
  })
})
