import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { PropRow } from './readme.js'
import { familyOf, openTypeProgram, propNamesOf, reachOf, valueExportsOf } from './readme-types.js'

const ROOT = process.cwd()
const at = (slug: string, file: string) => join(ROOT, 'src', 'components', slug, file)
const program = openTypeProgram(ROOT, [
  at('dialog', 'types.ts'), at('dialog', 'index.tsx'), at('card', 'types.ts'), at('card', 'index.tsx'),
  at('dropdown', 'types.ts'), at('toast', 'types.ts'),
])

const row = (name: string): PropRow => ({ name, required: false, type: '`boolean`', default: '-', description: name })

describe('the flat names of a part family come from its index.tsx', () => {
  it('lists the values it exports, in its order, and none of its types', () => {
    expect(valueExportsOf(program, at('dialog', 'index.tsx'))).toEqual([
      'DialogBody', 'DialogClose', 'DialogDescription', 'DialogFooter', 'DialogHeader', 'DialogPopup', 'DialogRoot',
      'DialogTitle', 'DialogTrigger',
    ])
  })
})

describe('each part is documented with what its own type accepts', () => {
  const exported = ['DialogBody', 'DialogHeader', 'DialogPopup', 'DialogRoot']
  const dialog = familyOf(program, at('dialog', 'types.ts'), exported, 'DialogRoot', [row('size'), row('closeButton'), row('stray')])

  it('puts the Root first and keeps the other parts in the order they are exported', () => {
    expect(dialog.parts.map((part) => part.name)).toEqual(['DialogRoot', 'DialogBody', 'DialogHeader', 'DialogPopup'])
  })

  it('gives a schema prop to the part that accepts it, and one no part accepts to the Root', () => {
    const names = Object.fromEntries(dialog.parts.map((part) => [part.name, part.rows.map((r) => r.name)]))
    expect(names).toEqual({
      DialogRoot: ['children', 'stray'],
      DialogBody: [],
      DialogHeader: ['closeButton'],
      DialogPopup: ['size'],
    })
  })

  it('reads every prop a type accepts, Base UI\'s too, so a Root without className is seen to draw nothing', () => {
    expect(propNamesOf(program, at('dialog', 'types.ts'), 'DialogRootProps').has('onOpenChange')).toBe(true)
    expect(dialog.parts[0]?.reach).toBe('none')
  })

  it('sees that CardRoot draws a div', () => {
    const card = familyOf(program, at('card', 'types.ts'), ['CardRoot', 'CardBody'], 'CardRoot', [])
    expect(card.parts[0]?.reach).toBe('element')
  })
})

describe('what each part passes on is read from its own type', () => {
  it('DropdownMenu takes a className and no id or ref, so it is never said to take attributes', () => {
    expect(reachOf(program, at('dropdown', 'types.ts'), 'DropdownMenu')).toBe('className')
    expect(reachOf(program, at('dropdown', 'types.ts'), 'DropdownPopup')).toBe('element')
  })

  it('ToastViewport takes a className alone, and the toast function has no props type at all', () => {
    expect(reachOf(program, at('toast', 'types.ts'), 'ToastViewport')).toBe('className')
    expect(reachOf(program, at('toast', 'types.ts'), 'toast')).toBe(null)
  })
})
