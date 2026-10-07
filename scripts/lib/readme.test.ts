import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { ComponentMeta } from '../../src/shared/meta.js'
import {
  HAND_END, HAND_START, handWrittenOf, mergeRows, printType, renderReadme, rowsFromJsonSchema,
} from './readme.js'

const meta: ComponentMeta = {
  name: 'Thing',
  slug: 'thing',
  category: 'actions',
  tier: 1,
  status: 'beta',
  rendering: 'server',
  baseUi: null,
  baseUiRange: null,
  optionalDeps: [],
}

const render = (over: Partial<Parameters<typeof renderReadme>[0]> = {}) =>
  renderReadme({ meta, props: [], demos: [], handWritten: 'prose', ...over })

describe('the type a reader sees', () => {
  it('lists the enum values, which is the answer to "what can I pass"', () => {
    expect(printType({ enum: ['solid', 'soft'] })).toBe('`solid` | `soft`')
  })

  it('prints the limits, so a clamped prop says where it clamps', () => {
    expect(printType({ type: 'number', minimum: 0, maximum: 5 })).toBe('`number`, min 0, max 5')
    expect(printType({ type: 'number', maximum: 5 })).toBe('`number`, max 5')
  })

  it('falls back to the plain type', () => {
    expect(printType({ type: 'boolean' })).toBe('`boolean`')
  })
})

describe('the rows come from the schema, not from prose', () => {
  const json = {
    properties: {
      variant: { type: 'string', enum: ['solid'], default: 'solid', description: 'The weight.' },
      label: { type: 'string' },
    },
    required: ['label'],
  }

  it('marks a required prop required and an optional one optional', () => {
    const rows = rowsFromJsonSchema(json)
    expect(rows.find((r) => r.name === 'label')?.required).toBe(true)
    expect(rows.find((r) => r.name === 'variant')?.required).toBe(false)
  })

  it('carries the default through, and says so when there is none', () => {
    const rows = rowsFromJsonSchema(json)
    expect(rows.find((r) => r.name === 'variant')?.default).toBe('`"solid"`')
    expect(rows.find((r) => r.name === 'label')?.default).toBe('-')
  })
})

describe('the schema and the types are merged, not concatenated', () => {
  const fromSchema = [{ name: 'size', required: false, type: '`a`', default: '`"md"`', description: 'Scale.' }]
  const fromTypes = [
    { name: 'size', required: false, type: '`string`', default: '-', description: '' },
    { name: 'label', required: true, type: '`string`', default: '-', description: 'The name.' },
  ]

  it('keeps the schema description and default where both describe a prop', () => {
    const size = mergeRows(fromSchema, fromTypes).find((r) => r.name === 'size')
    expect(size?.description).toBe('Scale.')
    expect(size?.default).toBe('`"md"`')
  })

  it('adds a prop only the type knows about, such as a required label', () => {
    expect(mergeRows(fromSchema, fromTypes).find((r) => r.name === 'label')?.required).toBe(true)
  })

  it('puts the required props first, because that is what a reader needs', () => {
    expect(mergeRows(fromSchema, fromTypes).map((r) => r.name)).toEqual(['label', 'size'])
  })

  it('lets the type decide required, since the schema cannot express it', () => {
    const merged = mergeRows(
      [{ name: 'alt', required: false, type: '`string`', default: '-', description: 'Alt.' }],
      [{ name: 'alt', required: true, type: '`string`', default: '-', description: '' }],
    )
    expect(merged[0]?.required).toBe(true)
  })
})

describe('the hand-written block survives a regeneration', () => {
  it('keeps whatever sits between the markers', () => {
    const file = `# T\n${HAND_START}\n## Why\nBecause.\n${HAND_END}\n## Props\n`
    expect(handWrittenOf(file)).toBe('## Why\nBecause.')
  })

  it('falls back to the placeholder for a new file or an empty block', () => {
    expect(handWrittenOf(null)).toContain('TODO(tc)')
    expect(handWrittenOf(`${HAND_START}\n\n${HAND_END}`)).toContain('TODO(tc)')
    expect(handWrittenOf('# T\nno markers here')).toContain('TODO(tc)')
  })

  it('round-trips: generate, read back, generate again, byte for byte', () => {
    const once = render({ handWritten: '## Why\nBecause it is the template.' })
    const twice = renderReadme({ meta, props: [], demos: [], handWritten: handWrittenOf(once) })
    expect(twice).toBe(once)
  })
})

describe('the page says the things a reader asks for', () => {
  it('opens no comment it does not close, which would hide the whole header', () => {
    const text = render()
    const opens = text.split('<!--').length - 1
    const closes = text.split('-->').length - 1
    expect(opens).toBe(closes)
  })

  it('escapes a pipe, or a union type silently breaks the table', () => {
    const text = render({
      props: [{ name: 'render', required: false, type: '`A | B`', default: '-', description: 'x' }],
    })
    expect(text).toContain('`A \\| B`')
  })

  it('names the required props above the table, not only inside it', () => {
    const text = render({
      props: [{ name: 'label', required: true, type: '`string`', default: '-', description: '' }],
    })
    expect(text).toContain('Required: `label`')
  })

  it('says every prop is optional when none is required', () => {
    expect(render()).toContain('Every prop below is optional')
  })

  it('states the rendering cost, which is the reason to pick this library', () => {
    expect(render()).toContain('ships no client JavaScript')
    expect(renderReadme({ meta: { ...meta, rendering: 'client' }, props: [], demos: [], handWritten: 'p' }))
      .toContain('runs in the browser')
  })

  it('records the Base UI version when there is one', () => {
    const text = renderReadme({
      meta: { ...meta, baseUi: 'Switch', baseUiRange: '1.8.0' },
      props: [], demos: [], handWritten: 'p',
    })
    expect(text).toContain('Base UI `Switch`, version 1.8.0')
  })
})

describe('the committed files match what the generator produces', () => {
  const root = process.cwd()

  it('gives Button a README that answers optional or mandatory for every prop', () => {
    const text = readFileSync(join(root, 'src', 'components', 'button', 'README.md'), 'utf8')
    for (const prop of ['variant', 'tone', 'size', 'loading', 'fullWidth', 'children', 'render']) {
      expect(text, prop).toContain(`\`${prop}\``)
    }
    expect(text).toContain('Every prop below is optional')
  })
})
