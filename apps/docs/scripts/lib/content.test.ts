import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { contentProblems, loadContent } from './content.js'

const valid = {
  slug: 'kbd',
  title: { en: 'Kbd', ar: 'مفتاح' },
  description: {
    en: 'A keycap for a key the reader presses, rendered on the server with no JavaScript.',
    ar: 'غطاء مفتاح لمفتاح يضغطه القارئ، يُعرض على الخادم بلا أي JavaScript على الإطلاق.',
  },
  demos: ['keys', 'rtl'],
  stageDemo: 'keys',
  stageHeight: 8,
  note: { en: 'Keys are siblings.', ar: 'المفاتيح متجاورة.' },
  notes: { en: ['One.'], ar: ['واحد.'] },
  keyboard: [],
  accessibility: { en: ['A kbd element.'], ar: ['عنصر kbd.'] },
  rtl: { en: 'Nothing to set.', ar: 'لا شيء يُضبط.' },
  related: { components: ['button'], pages: ['accessibility'] },
}

const context = { slug: 'kbd', demos: ['keys', 'nested', 'rtl'], pages: new Set(['kbd', 'button']), hasSchema: false }

describe('contentProblems', () => {
  it('passes a file in the shape the content branches use', () => {
    expect(contentProblems(valid, context)).toEqual([])
  })

  it('reports a description outside 50 to 160 characters, per locale', () => {
    const short = { ...valid, description: { en: 'Too short.', ar: valid.description.ar } }
    expect(contentProblems(short, context)).toEqual(['description.en: Too small: expected string to have >=50 characters'])
  })

  it('reports an unknown key, so a typo cannot pass as an optional field', () => {
    expect(contentProblems({ ...valid, stageDemos: 'keys' }, context)).toEqual(['(file): Unrecognized key: "stageDemos"'])
  })

  it('reports a demo, a stageDemo or a codeDemo with no file, a demo listed twice and a related slug with no page', () => {
    const wrong = { ...valid, demos: ['keys', 'keys', 'basic'], stageDemo: 'default', codeDemo: 'sample', related: { components: ['meter'], pages: [] } }
    expect(contentProblems(wrong, context)).toEqual([
      'demo basic has no dummy/basic.tsx',
      'a demo is listed twice',
      'stageDemo default has no dummy/default.tsx',
      'codeDemo sample has no dummy/sample.tsx',
      'related component meter has no page',
    ])
  })

  it('asks a component with no schema for a stageDemo, and checks the slug against the file', () => {
    const { stageDemo: _, ...noStage } = valid
    expect(contentProblems({ ...noStage, slug: 'key' }, context)).toEqual([
      'slug is key, the file is kbd',
      'no schema, so the stage needs a stageDemo',
    ])
    expect(contentProblems(noStage, { ...context, hasSchema: true })).toEqual([])
  })

  it('reports lists whose en and ar counts differ', () => {
    expect(contentProblems({ ...valid, notes: { en: ['One.', 'Two.'], ar: ['واحد.'] } }, context))
      .toEqual(['notes has a different count in en and ar'])
  })
})

describe('loadContent', () => {
  it('returns the exported object whose slug matches, and null for a missing file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'content-'))
    writeFileSync(join(dir, 'switch.ts'), "export const other = { slug: 'x' }\nexport const switchControl = { slug: 'switch' }\n")
    expect(await loadContent(dir, 'switch')).toEqual({ slug: 'switch' })
    expect(await loadContent(dir, 'missing')).toBeNull()
  })
})
