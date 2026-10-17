import { describe, expect, it } from 'vitest'

import { isAtRule, parseCss, splitTopLevel } from './css-parse.js'

const rules = (css: string) => parseCss(css).rules
const decls = (css: string) =>
  rules(css).flatMap((r) => r.declarations.map((d) => `${r.prelude}|${d.property}:${d.value}`))

describe('parseCss', () => {
  it('reads a declaration with no trailing semicolon, which CSS allows', () => {
    expect(decls('.a { color: red }')).toEqual(['.a|color:red'])
  })

  it('keeps the last declaration of a block even when earlier ones end in semicolons', () => {
    expect(decls(':root { --tc-a: 1; --tc-b: 2 }')).toEqual([':root|--tc-a:1', ':root|--tc-b:2'])
  })

  it('takes only the first colon, so a url value survives', () => {
    expect(decls('.a { background: url(http://x/y) }')).toEqual(['.a|background:url(http://x/y)'])
  })

  it('records the line a declaration starts on, not the line it ends on', () => {
    const css = 'body {\n  grid-template-columns:\n    1fr 1fr;\n}'
    expect(rules(css)[0]?.declarations[0]?.line).toBe(2)
  })

  it('nests, so an inner rule knows what wraps it', () => {
    const inner = rules('@media print {\n  @layer base {\n    .a { color: red }\n  }\n}')
    expect(inner.at(-1)?.ancestors).toEqual(['@media print', '@layer base'])
  })

  it('does not let a statement at-rule glue itself onto the next selector', () => {
    const css = ':root { --tc-a: 1; }\n@import "x.css";\n.b { color: red }'
    expect(rules(css).map((r) => r.prelude)).toEqual([':root', '.b'])
  })

  it('keeps an @source statement out of the selector that follows it', () => {
    const css = '@source "./components";\n@source "./shared";\n:root { --tc-a: 1 }'
    expect(rules(css).map((r) => r.prelude)).toEqual([':root'])
  })

  it('ignores a colon inside a media query, which is not a declaration', () => {
    const css = '@media (prefers-reduced-motion: reduce) { :root { --tc-motion: 0 } }'
    expect(rules(css).map((r) => r.prelude)).toEqual(['@media (prefers-reduced-motion: reduce)', ':root'])
    expect(decls(css)).toEqual([':root|--tc-motion:0'])
  })
})

describe('parseCss inside a string', () => {
  it('does not read a comment opener in a quoted value', () => {
    expect(decls('.a::after { content: "/*"; }\nbody { color: red }')).toEqual([
      '.a::after|content:"/*"', 'body|color:red',
    ])
  })

  it('does not read a closing brace in a quoted value', () => {
    const css = '@layer components {\n  .a::after { content: "}" }\n  .b { color: red }\n}'
    expect(rules(css).at(-1)?.ancestors).toEqual(['@layer components'])
  })

  it('does not read a semicolon in a quoted value as the end of a declaration', () => {
    expect(decls('.a::after { content: "x;y"; color: red }')).toEqual([
      '.a::after|content:"x;y"', '.a::after|color:red',
    ])
  })

  it('keeps a bracketed attribute selector whole', () => {
    expect(rules('.a[data-x="{"] { color: red }').map((r) => r.prelude)).toEqual(['.a[data-x="{"]'])
  })

  it('reads an escaped quote rather than ending the string on it', () => {
    expect(decls('.a { content: "he said \\"hi\\""; color: red }').at(-1)).toBe('.a|color:red')
  })
})

describe('comments', () => {
  it('reports the opening line and how many lines it spans', () => {
    expect(parseCss(':root { --tc-a: 1 }\n\n/* one\n two */').comments).toEqual([{ line: 3, span: 2 }])
  })

  it('does not count a comment opener that is inside a string', () => {
    expect(parseCss('.a::after { content: "/*"; }\n/* a note */').comments).toEqual([{ line: 2, span: 1 }])
  })

  it('survives an unterminated comment instead of looping', () => {
    expect(parseCss('/* never closed').comments).toEqual([{ line: 1, span: 1 }])
  })
})

describe('splitTopLevel', () => {
  it('splits a plain selector list', () => {
    expect(splitTopLevel(':root, [data-theme]', ',').map((s) => s.trim())).toEqual([':root', '[data-theme]'])
  })

  it('keeps a functional pseudo-class whole', () => {
    expect(splitTopLevel(':where(:root, [data-theme]), .a', ',').map((s) => s.trim())).toEqual([
      ':where(:root, [data-theme])', '.a',
    ])
  })

  it('keeps a bracketed value whole', () => {
    expect(splitTopLevel('[data-x="a,b"], .c', ',')).toHaveLength(2)
  })
})

describe('isAtRule', () => {
  it('matches the at-rule and its parameterised form', () => {
    expect(isAtRule('@layer', '@layer')).toBe(true)
    expect(isAtRule('@layer base', '@layer')).toBe(true)
  })

  it('does not match a different at-rule that merely starts the same', () => {
    expect(isAtRule('@layerx', '@layer')).toBe(false)
  })
})
