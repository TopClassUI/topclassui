import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { headingsOf, tocOf, uniqueIds } from './toc.js'

describe('headingsOf', () => {
  it('takes the h2 lines only, with the id the h2 mapping gives them', () => {
    const mdx = '# Install\n\nLead.\n\n## With pnpm\n\n### A detail\n\n## Peer dependencies ##\n'
    expect(headingsOf(mdx)).toEqual([
      { text: 'With pnpm', id: 'with-pnpm' },
      { text: 'Peer dependencies', id: 'peer-dependencies' },
    ])
  })

  it('ignores a ## line inside a fenced block of either kind', () => {
    const mdx = '## Before\n\n```md\n## Not a heading\n```\n\n~~~~\n## Nor this\n```\n~~~~\n\n## After\n'
    expect(headingsOf(mdx).map((entry) => entry.text)).toEqual(['Before', 'After'])
  })

  it('drops the code ticks from the text and slugs Arabic headings', () => {
    expect(headingsOf('## The `size` prop\r\n## مدخل CSS\n')).toEqual([
      { text: 'The size prop', id: 'the-size-prop' },
      { text: 'مدخل CSS', id: 'مدخل-css' },
    ])
  })

  it('needs a space after the hashes', () => {
    expect(headingsOf('##Tight\n#### Deep\n')).toEqual([])
  })
})

describe('uniqueIds', () => {
  it('numbers a repeated id from the second one on', () => {
    expect(uniqueIds([{ text: 'Usage', id: 'usage' }, { text: 'Usage', id: 'usage' }, { text: 'Usage', id: 'usage' }]))
      .toEqual([{ text: 'Usage', id: 'usage' }, { text: 'Usage', id: 'usage-2' }, { text: 'Usage', id: 'usage-3' }])
  })
})

describe('tocOf', () => {
  it('reads every page of both locales and skips a locale with no folder', () => {
    const dir = mkdtempSync(join(tmpdir(), 'toc-'))
    mkdirSync(join(dir, 'en'))
    writeFileSync(join(dir, 'en', 'css.mdx'), '## The three lines\n')
    writeFileSync(join(dir, 'en', 'notes.txt'), '## Not MDX\n')
    expect(tocOf(dir)).toEqual({ en: { css: [{ text: 'The three lines', id: 'the-three-lines' }] }, ar: {} })
  })
})
