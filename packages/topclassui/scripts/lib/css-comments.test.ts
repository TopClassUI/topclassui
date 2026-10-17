import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { findLongComments } from './css-layers.js'

describe('findLongComments', () => {
  it('accepts a one-line comment, which is what the rule allows', () => {
    expect(findLongComments('/* why this exists */\n:root { --tc-a: 1; }')).toEqual([])
  })

  it('catches a two-line comment and says how far it ran', () => {
    expect(findLongComments('/* first\n   second */')).toEqual([{ line: 1, span: 2 }])
  })

  it('reports the line the comment opens on, not the file start', () => {
    expect(findLongComments(':root { --tc-a: 1; }\n\n/* one\n two\n three */')).toEqual([
      { line: 3, span: 3 },
    ])
  })

  it('finds every long comment, not only the first', () => {
    expect(findLongComments('/* a\nb */\n/* ok */\n/* c\nd */').map((c) => c.line)).toEqual([1, 4])
  })

  it('does not count a comment opener that is inside a quoted value', () => {
    expect(findLongComments('.a::after { content: "/*"; }\n/* a note */')).toEqual([])
  })

  it('reads CRLF the same as LF, because the repo is checked out on Windows', () => {
    expect(findLongComments('/* a\r\nb */')).toEqual([{ line: 1, span: 2 }])
    expect(findLongComments('/* one line */\r\n:root { --tc-a: 1 }')).toEqual([])
  })

  it('passes on both shipped stylesheets', () => {
    for (const file of ['tokens.css', 'styles.css']) {
      const css = readFileSync(join(process.cwd(), 'src', file), 'utf8')
      expect(findLongComments(css), file).toEqual([])
    }
  })
})
