import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { openTypeProgram } from '../../../../packages/topclassui/scripts/lib/readme-types.js'
import { COMPONENTS, LIBRARY, metaOf } from './library.js'
import { jsonSchemaOf, propsOf, withLimits } from './props.js'

const program = openTypeProgram(LIBRARY, ['button', 'dialog', 'pagination', 'kbd']
  .flatMap((slug) => ['types.ts', 'index.tsx'].map((f) => join(COMPONENTS, slug, f)))
  .filter((f) => existsSync(f)))

const partsOf = async (slug: string) => {
  const dir = join(COMPONENTS, slug)
  return propsOf(program, dir, await metaOf(dir), await jsonSchemaOf(dir))
}

describe('propsOf, through the README generator', () => {
  it('gives Button the rows its README prints, in the same order', async () => {
    const [button] = await partsOf('button')
    expect(button?.name).toBe('Button')
    expect(button?.rows.map((row) => [row.name, row.required, row.type, row.default])).toEqual([
      ['children', false, '`ReactNode`', '-'],
      ['fullWidth', false, '`boolean`', '`false`'],
      ['loading', false, '`boolean`', '`false`'],
      ['render', false, '`ReactElement`', '-'],
      ['size', false, '`xs` | `sm` | `md` | `lg` | `xl` | `custom`', '`"md"`'],
      ['tone', false, '`primary` | `neutral` | `success` | `warning` | `danger` | `info`', '`"primary"`'],
      ['variant', false, '`solid` | `soft` | `outline` | `ghost` | `link`', '`"solid"`'],
    ])
  })

  it('documents a part family part by part, the Root first', async () => {
    expect((await partsOf('dialog')).map((part) => part.name)).toEqual([
      'DialogRoot', 'DialogBody', 'DialogClose', 'DialogDescription', 'DialogFooter', 'DialogHeader', 'DialogPopup',
      'DialogTitle', 'DialogTrigger',
    ])
  })

  it('carries the schema bounds into the Limits columns, the required rows first', async () => {
    const [pagination] = await partsOf('pagination')
    const limits = pagination?.rows.filter((row) => row.min !== null).map((row) => [row.name, row.min, row.max])
    expect(limits).toEqual([
      ['pageCount', 1, 9007199254740991],
      ['value', 1, 9007199254740991],
      ['boundaryCount', 0, 3],
      ['siblingCount', 0, 3],
    ])
  })

  it('still gives a component with no schema its typed props', async () => {
    const [kbd] = await partsOf('kbd')
    expect(kbd?.name).toBe('Kbd')
    expect(kbd?.rows.every((row) => row.min === null && row.max === null)).toBe(true)
  })
})

describe('jsonSchemaOf', () => {
  it('returns null for a folder with no schema.ts', async () => {
    expect(await jsonSchemaOf(join(COMPONENTS, 'timeline'))).toBeNull()
  })
})

describe('withLimits', () => {
  it('sets null where the schema has no bound or no such prop', () => {
    const row = { name: 'rows', required: false, type: '`number`', default: '`3`', description: '' }
    expect(withLimits([row], { properties: { rows: { type: 'integer', minimum: 1 } } })).toEqual([{ ...row, min: 1, max: null }])
    expect(withLimits([row], null)).toEqual([{ ...row, min: null, max: null }])
  })
})
