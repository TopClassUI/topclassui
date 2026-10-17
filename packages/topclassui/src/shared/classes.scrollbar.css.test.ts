import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { SCROLLBAR } from './classes.js'

const WIDTH = '[scrollbar-width:thin]'
const COLOR = '[scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]'

/** The rule Tailwind emits for one class: its selector up to the closing brace. */
function ruleFor(css: string, cls: string): string {
  const at = css.indexOf(`.${cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')}`)
  return at === -1 ? '' : css.slice(at, css.indexOf('}', at) + 1)
}

describe('the shared scrollbar', () => {
  it('is exactly two classes: a thin native bar, in the thumb and the track of the theme', () => {
    expect(SCROLLBAR.split(' ')).toEqual([WIDTH, COLOR])
  })

  // Forced colours compute scrollbar-color to auto, so the system colours win there with no class of ours.
  it('carries no forced-colors variant and no system colour', () => {
    expect(SCROLLBAR).not.toMatch(/forced-colors:|Canvas|Highlight|ButtonText/)
  })
})

describe('the shared scrollbar compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build([WIDTH, COLOR]))

  it('the width is the thin native bar', async () => {
    expect(ruleFor(await css, WIDTH)).toBe('.\\[scrollbar-width\\:thin\\] {\n    scrollbar-width: thin;\n  }')
  })

  it('the colour is the thumb then the track, both read from the two tokens', async () => {
    expect(ruleFor(await css, COLOR)).toContain('scrollbar-color: var(--tc-scrollbar-thumb) var(--tc-scrollbar-track);')
  })

  it('neither sits inside a forced-colors query', async () => {
    const text = await css
    expect(text).toContain('scrollbar-width: thin;')
    expect(text).not.toMatch(/forced-colors[^{]*\{[^}]*scrollbar/)
  })
})
