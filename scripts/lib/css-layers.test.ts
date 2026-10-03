import { describe, expect, it } from 'vitest'

import { findUnlayeredDeclarations } from './css-layers.js'

const find = (css: string) => findUnlayeredDeclarations(css)
const props = (css: string) => find(css).map((o) => o.property)

describe('findUnlayeredDeclarations', () => {
  it('allows a custom property outside a layer, which is the whole tokens file', () => {
    expect(find(':root { --tc-radius: 0.5rem; }')).toEqual([])
  })

  it('catches a normal declaration outside a layer, with its line and selector', () => {
    const css = ':root {\n  --tc-radius: 0.5rem;\n  color-scheme: light;\n}'
    expect(find(css)).toEqual([{ line: 3, property: 'color-scheme', selector: ':root' }])
  })

  it('allows the same declaration inside @layer base', () => {
    expect(find('@layer base {\n  :root { color-scheme: light; }\n}')).toEqual([])
  })

  it('allows @utility and @custom-variant, which Tailwind layers itself', () => {
    expect(find('@utility pb-safe { padding-bottom: 1px; }')).toEqual([])
    expect(find('@custom-variant hover {\n  @media (hover: hover) { &:hover { @slot } }\n}')).toEqual([])
  })

  it('still allows custom properties under @media, as reduced motion needs', () => {
    expect(find('@media (prefers-reduced-motion: reduce) {\n  :root { --tc-motion: 0; }\n}')).toEqual([])
  })

  it('does not let @media hide an unlayered rule', () => {
    expect(find('@media print {\n  body { display: none; }\n}')).toEqual([
      { line: 2, property: 'display', selector: 'body' },
    ])
  })

  it('catches a declaration with no trailing semicolon before the brace', () => {
    expect(find('body { display: none }')).toHaveLength(1)
  })

  it('reports a sibling rule after a layer, not the rule inside it', () => {
    const css = '@layer base {\n  html { color: red; }\n}\nhtml { color: blue; }'
    expect(find(css)).toEqual([{ line: 4, property: 'color', selector: 'html' }])
  })
})

describe('at-rules a cascade layer cannot reorder', () => {
  it('exempts @keyframes', () => {
    expect(find('@keyframes spin { to { transform: rotate(1turn); } }')).toEqual([])
  })

  it('exempts @property, so a registered custom property is not an offence', () => {
    const css = '@property --tc-dir { syntax: "<number>"; inherits: true; initial-value: 1; }'
    expect(find(css)).toEqual([])
  })

  it('exempts @font-face and @counter-style', () => {
    expect(find('@font-face { font-family: X; src: url(x.woff2); }')).toEqual([])
    expect(find('@counter-style thumbs { system: cyclic; symbols: "x"; }')).toEqual([])
  })

  it('does not exempt an at-rule that merely starts like @layer', () => {
    expect(props('@layerx { body { color: red } }')).toEqual(['color'])
  })
})

describe('a quoted value is never read as syntax', () => {
  it('does not lose the offences after a comment opener in a string', () => {
    const css = '.a::after { content: "/*"; }\nbody { color: red; }\n/* a note */'
    expect(props(css)).toEqual(['content', 'color'])
  })

  it('does not let a fake at-rule in a string exonerate what follows it', () => {
    expect(props('.a::after { content: "x;@layer y{"; color: red; }')).toEqual(['content', 'color'])
  })

  it('does not report a layered rule because a string held a closing brace', () => {
    const css = '@layer components {\n  .a::after { content: "}"; }\n  .b { color: red; }\n}'
    expect(find(css)).toEqual([])
  })

  it('keeps the selector intact when an attribute value holds a brace', () => {
    expect(find('.a[data-x="{"] { color: red; }')).toEqual([
      { line: 1, property: 'color', selector: '.a[data-x="{"]' },
    ])
  })
})
