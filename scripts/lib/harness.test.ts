import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { LANG, PAGE_CANDIDATES, candidatesIn, findDemos, pageHtml, pageName } from './harness.js'

const made: string[] = []
afterAll(() => { for (const dir of made) rmSync(dir, { recursive: true, force: true }) })

/** A checkout with only the files named, each empty. */
function checkout(files: readonly string[]): string {
  const root = mkdtempSync(join(tmpdir(), 'tc-harness-'))
  made.push(root)
  for (const file of files) {
    const path = join(root, ...file.split('/'))
    mkdirSync(join(path, '..'), { recursive: true })
    writeFileSync(path, '')
  }
  return root
}

describe('finding the demos', () => {
  const root = checkout([
    'src/components/tooltip/dummy/rtl.tsx',
    'src/components/tooltip/dummy/basic.tsx',
    'src/components/tooltip/dummy/notes.md',
    'src/components/tooltip/index.tsx',
    'src/components/avatar-group/dummy/four.tsx',
    'src/components/icon/index.tsx',
    'src/components/README.md',
  ])

  it('names each one <folder>--<file> and sorts the files of a folder', () => {
    expect(findDemos(root).map((demo) => demo.name).sort()).toEqual([
      'avatar-group--four', 'tooltip--basic', 'tooltip--rtl',
    ])
    const tooltip = findDemos(root).filter((demo) => demo.name.startsWith('tooltip--'))
    expect(tooltip.map((demo) => demo.name)).toEqual(['tooltip--basic', 'tooltip--rtl'])
  })

  it('gives the file to import, and skips a folder with no dummy and a file that is no demo', () => {
    const found = findDemos(root)
    expect(found.find((demo) => demo.name === 'tooltip--basic')?.file)
      .toBe(join(root, 'src', 'components', 'tooltip', 'dummy', 'basic.tsx'))
    expect(found).toHaveLength(3)
  })

  it('finds the real ones, the tooltip among them', () => {
    const names = findDemos(process.cwd()).map((demo) => demo.name)
    expect(names.length).toBeGreaterThan(150)
    expect(names).toContain('tooltip--basic')
    expect(names).toContain('button--long-label')
    expect(names.filter((name) => name.startsWith('icon--'))).toEqual([])
  })
})

describe('the page both harnesses write', () => {
  const page = { mode: 'dark', direction: 'rtl', demo: 'tooltip--basic', body: '<button>B</button>' } as const

  it('is this, byte for byte, when nothing is added to it', () => {
    expect(pageHtml(page, '.a{}')).toBe([
      '<!doctype html>',
      '<html lang="ar" dir="rtl" data-theme="dark">',
      '<head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<title>tooltip--basic - dark - rtl</title>',
      '<style>.a{}</style>',
      '</head>',
      '<body class="bg-page text-body">',
      '<h1 class="sr-only">tooltip--basic</h1>',
      '<main id="demo" class="p-8"><button>B</button></main>',
      '</body>',
      '</html>',
      '',
    ].join('\n'))
  })

  it('puts what the live harness adds at the end of the head, on the body and after the demo', () => {
    const html = pageHtml(page, '', { head: '<script>T</script>\n', bodyAttributes: ' data-edge="top"', tail: '<script>H</script>\n' })
    expect(html).toContain('<style></style>\n<script>T</script>\n</head>')
    expect(html).toContain('<body class="bg-page text-body" data-edge="top">')
    expect(html).toContain('<main id="demo" class="p-8"><button>B</button></main>\n<script>H</script>\n</body>')
  })

  it('speaks English left to right and Arabic right to left', () => {
    expect(LANG).toEqual({ ltr: 'en', rtl: 'ar' })
    expect(pageHtml({ ...page, direction: 'ltr' }, '')).toContain('<html lang="en" dir="ltr" data-theme="dark">')
  })

  it('names its own classes, which no demo renders, for the stylesheet', () => {
    expect(candidatesIn(pageHtml(page, '')).sort()).toEqual(['bg-page', 'p-8', 'sr-only', 'text-body'])
    expect([...PAGE_CANDIDATES].sort()).toEqual(['bg-page', 'p-8', 'sr-only', 'text-body'])
  })

  it('names a page after its demo, mode and direction', () => {
    expect(pageName('tooltip--basic', 'ocean', 'ltr')).toBe('tooltip--basic--ocean--ltr.html')
  })
})
