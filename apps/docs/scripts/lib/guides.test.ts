import { describe, expect, it } from 'vitest'

import { blockSource, groupProblems, guideFacts, iconGroupsOf, shadeOf } from './guides.js'

const facts = guideFacts()

describe('iconGroupsOf', () => {
  it('reads each bold line of The set, and only that section', () => {
    const md = '## The set\n\n**Arrows** (2) - `arrow-up` `arrow-down`\n\n**Solid** (1) - `star-fill`\n\n## Later\n\n**Other** (1) - `x`\n'
    expect(iconGroupsOf(md)).toEqual([
      { title: 'Arrows', names: ['arrow-up', 'arrow-down'] },
      { title: 'Solid', names: ['star-fill'] },
    ])
  })

  it('fails a group whose count is not its list', () => {
    expect(() => iconGroupsOf('## The set\n\n**Arrows** (3) - `arrow-up`\n\n## Later\n')).toThrow('Arrows says 3 and lists 1')
  })
})

describe('groupProblems', () => {
  it('names an icon in no group, in two groups, or with no file', () => {
    const groups = [{ title: 'A', names: ['x', 'y'] }, { title: 'B', names: ['y', 'ghost'] }]
    expect(groupProblems(groups, ['x', 'y', 'z'])).toEqual([
      'z is in raw/ and in no group',
      'y is in two groups',
      'ghost has no raw/ghost.svg',
    ])
  })
})

describe('the icon facts', () => {
  it('count 84 icons, 16 of them directional, in the five groups of docs/icons.md', () => {
    expect(facts.icons.total).toBe(84)
    expect(facts.icons.directional).toBe(16)
    expect(facts.icons.groups.map((group) => [group.title, group.names.length])).toEqual([
      ['Arrows and carets', 13],
      ['Actions', 19],
      ['Status and feedback', 13],
      ['Objects and places', 36],
      ['Solid variants', 3],
    ])
  })

  it('mark the solid three and the directional sixteen on each icon', () => {
    expect(facts.icons.all.filter((icon) => icon.solid).map((icon) => icon.name)).toEqual(['circle-fill', 'heart-fill', 'star-fill'])
    expect(facts.icons.all.filter((icon) => icon.directional).length).toBe(16)
    expect(facts.icons.all.find((icon) => icon.name === 'arrows-clockwise')?.directional).toBe(false)
  })
})

describe('the token facts', () => {
  it('name each shade the way tokens.css writes it, mode by mode', () => {
    expect(facts.tokens['--tc-primary-solid']?.shade).toEqual({
      light: { kind: 'shade', name: 'blue-600' },
      dark: { kind: 'shade', name: 'blue-600' },
      ocean: { kind: 'shade', name: 'cyan-700' },
    })
    expect(facts.tokens['--tc-primary-soft']?.shade.dark).toEqual({ kind: 'mix', percent: 24, of: 'primary-solid' })
    expect(facts.tokens['--tc-ring']?.shade.light).toEqual({ kind: 'shade', name: 'blue-800' })
  })

  it('carry a measured pair for text, lines, the ring and every tone role, and none for a surface', () => {
    expect(facts.tokens['--tc-page']?.contrast).toBeNull()
    expect(facts.tokens['--tc-line']?.contrast).toBeNull()
    expect(facts.tokens['--tc-line-strong']?.contrast?.dark.min).toBe(3)
    expect(facts.tokens['--tc-danger-on-solid']?.contrast?.light.min).toBe(4.5)
    for (const [name, fact] of Object.entries(facts.tokens)) {
      for (const measured of Object.values(fact.contrast ?? {})) expect(measured.ratio, name).toBeGreaterThanOrEqual(measured.min + 0.15)
    }
  })

  it('follow a var() chain to the palette and stop at a literal', () => {
    const tokens = new Map([['--tc-a', 'var(--tc-b)'], ['--tc-b', 'var(--color-red-600)'], ['--tc-c', 'oklch(0 0 0 / 0.5)']])
    expect(shadeOf('--tc-a', tokens)).toEqual({ kind: 'shade', name: 'red-600' })
    expect(shadeOf('--tc-c', tokens)).toEqual({ kind: 'value', text: 'oklch(0 0 0 / 0.5)' })
  })
})

describe('the knobs and the mode blocks', () => {
  it('read the six knobs Theming lists at their :root defaults', () => {
    expect([
      facts.knobs['--tc-radius'], facts.knobs['--tc-density'], facts.knobs['--tc-motion'],
      facts.knobs['--tc-list-rows'], facts.knobs['--tc-ring-width'], facts.knobs['--tc-line-width'],
    ]).toEqual(['0.5rem', '1', '1', '7', '2px', '1px'])
  })

  it('copy a mode block from its selector to its closing brace', () => {
    const css = ':root {\n  --a: 1;\n}\n\n[data-theme=\'ocean\'] {\n  --tc-radius: 9999px;\n}\n'
    expect(blockSource(css, "[data-theme='ocean']")).toBe("[data-theme='ocean'] {\n  --tc-radius: 9999px;\n}")
    expect(facts.modeBlocks.ocean.split('\n')[0]).toBe("[data-theme='ocean'] {")
    expect(facts.modeBlocks.dark).toContain('--tc-primary-mix: 24%;')
  })

  it('skip a selector list that ends in the same selector, so the ocean sample is never the light block', () => {
    const css = ":root,\n[data-theme='ocean'] {\n  --tc-page: white;\n}\n\n[data-theme='ocean'] {\n  --tc-radius: 9999px;\n}\n"
    expect(blockSource(css, "[data-theme='ocean']")).toBe("[data-theme='ocean'] {\n  --tc-radius: 9999px;\n}")
    expect(facts.modeBlocks.ocean).toContain('--tc-primary-solid: var(--color-cyan-700);')
    expect(facts.modeBlocks.ocean).not.toContain('--tc-page')
  })
})
