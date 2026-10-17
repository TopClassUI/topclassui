import type { ComponentType } from 'react'
import { describe, expect, it } from 'vitest'

import { classList, markup } from '#test/markup.js'
import { CardBody, CardFooter, CardHeader, CardRoot } from '../index.js'
import type { CardRootProps } from '../types.js'

const classes = (Part: ComponentType<CardRootProps>, className?: string) =>
  classList(markup(<Part className={className}>Inside</Part>)).sort()

/** The Build this block, written out per part and sorted: an extra class fails as surely as a missing one. */
const EXACT = {
  CardRoot: [
    'bg-surface-raised', 'border-(length:--tc-line-width)', 'border-line',
    'flex', 'flex-col', 'gap-2', 'p-5', 'rounded-box',
  ],
  CardHeader: ['font-semibold', 'text-base', 'text-body'],
  CardBody: ['text-muted', 'text-sm'],
  CardFooter: ['flex', 'flex-wrap', 'gap-2', 'items-center', 'pt-1'],
}

/** Each consumer class conflicts with one of the part's own, so only a className passed last wins. */
const CONFLICT = {
  CardRoot: {
    given: 'rounded-chip p-2 gap-4 bg-surface',
    after: [
      'bg-surface', 'border-(length:--tc-line-width)', 'border-line',
      'flex', 'flex-col', 'gap-4', 'p-2', 'rounded-chip',
    ],
  },
  CardHeader: { given: 'text-lg font-bold text-muted', after: ['font-bold', 'text-lg', 'text-muted'] },
  CardBody: { given: 'text-base text-body', after: ['text-base', 'text-body'] },
  CardFooter: {
    given: 'gap-4 pt-3 flex-nowrap items-start',
    after: ['flex', 'flex-nowrap', 'gap-4', 'items-start', 'pt-3'],
  },
}

type Name = keyof typeof EXACT

/** A list, not an object: an object of components is the namespace R-9.2-3 bans. */
const PARTS: [Name, ComponentType<CardRootProps>][] = [
  ['CardRoot', CardRoot],
  ['CardHeader', CardHeader],
  ['CardBody', CardBody],
  ['CardFooter', CardFooter],
]

describe('every part carries exactly the classes the spec names', () => {
  for (const [name, Part] of PARTS) {
    it(`${name} emits its own set and nothing else`, () => {
      expect(classes(Part), name).toEqual(EXACT[name])
    })
  }

  it('puts the padding and the gap on the root, so a card needs no inner wrapper', () => {
    expect(classes(CardRoot)).toContain('p-5')
    expect(classes(CardRoot)).toContain('gap-2')
  })

  it('draws the hairline border at the knob width, with the decorative line colour', () => {
    const list = classes(CardRoot)
    expect(list).toContain('border-(length:--tc-line-width)')
    expect(list).toContain('border-line')
    expect(list).not.toContain('border-line-strong')
  })

  it('keeps the body a block, so a sentence with a link in it never stacks as rows', () => {
    expect(classes(CardBody).filter((c) => /^(flex|grid|inline-flex)/.test(c))).toEqual([])
  })
})

describe('className is passed last on every part', () => {
  for (const [name, Part] of PARTS) {
    const conflict = CONFLICT[name]

    it(`${name} lets every conflicting consumer class replace its own`, () => {
      expect(classes(Part, conflict.given), name).toEqual(conflict.after)
    })

    it(`${name} keeps a consumer class that conflicts with nothing`, () => {
      expect(classes(Part, 'ms-2'), name).toContain('ms-2')
    })
  }
})

describe('Card is not interactive, and leaves its children alone', () => {
  for (const [name, Part] of PARTS) {
    it(`${name} carries no ring, hover, transition, touch target or disabled state`, () => {
      const interactive = /^(hover:|active:|focus|outline-|transition|duration-|min-[hw]-|disabled:|data-disabled:|cursor-)/
      expect(classes(Part).filter((c) => interactive.test(c)), name).toEqual([])
    })

    it(`${name} aims no class at its descendants, so a Button inside keeps its own size`, () => {
      expect(classes(Part).filter((c) => /^(\*|\[&|has-|group|peer)|svg/.test(c)), name).toEqual([])
    })

    it(`${name} names no palette colour`, () => {
      const palette = /-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/
      expect(classes(Part).filter((c) => palette.test(c)), name).toEqual([])
    })
  }
})
