import { describe, expect, it } from 'vitest'

import { ARABIC_PRELOAD_SCRIPT } from './arabic-preload'

interface Link { rel: string; as: string; type: string; crossOrigin: string | null; href: string }

const FONT_FACE = 5
const STYLE = 1

function face(family: string, src: string, range: string) {
  const values: Record<string, string> = { 'font-family': family, src, 'unicode-range': range }
  return { type: FONT_FACE, style: { getPropertyValue: (name: string) => values[name] ?? '' } }
}

/** Runs the script against a page whose stylesheets hold these rules, and returns the links it added to the head. */
function run(sheets: { href: string | null; cssRules: unknown[] | 'cross-origin' }[]): Link[] {
  const added: Link[] = []
  const styleSheets = sheets.map((sheet) => ({
    href: sheet.href,
    get cssRules() {
      if (sheet.cssRules === 'cross-origin') throw new Error('SecurityError')
      return sheet.cssRules
    },
  }))
  const document = {
    styleSheets,
    baseURI: 'https://topclassui.com/ar',
    createElement: () => ({ rel: '', as: '', type: '', crossOrigin: null, href: '' }),
    head: { appendChild: (link: Link) => { added.push(link) } },
  }
  new Function('document', ARABIC_PRELOAD_SCRIPT)(document)
  return added
}

const FONTS_CSS = 'https://topclassui.com/_next/static/chunks/fonts.css'

describe('the Arabic page preload (lib/arabic-preload.ts)', () => {
  it("preloads the faces of an alef and a Latin a, once each, resolved against the stylesheet's address", () => {
    const links = run([
      { href: 'https://topclassui.com/_next/static/chunks/globals.css', cssRules: [{ type: STYLE }] },
      {
        href: FONTS_CSS,
        cssRules: [
          face('Inter', 'url(../media/inter.woff2) format("woff2")', 'U+??, U+131'),
          face('"Noto Sans Arabic"', 'url("../media/arabic.woff2") format("woff2")', 'U+6??, U+750-77F'),
          face('"Noto Sans Arabic"', 'url("../media/math.woff2") format("woff2")', 'U+302-303, U+1D400-1D7FF'),
          face('"Noto Sans Arabic"', 'url("../media/latin-ext.woff2") format("woff2")', 'U+100-2BA'),
          face('"Noto Sans Arabic"', 'url("../media/latin.woff2") format("woff2")', 'U+0-FF, U+131'),
          face('"Noto Sans Arabic"', 'url("../media/arabic.woff2") format("woff2")', 'U+600-6FF, U+750-77F'),
          { type: STYLE },
        ],
      },
    ])
    expect(links).toEqual([
      { rel: 'preload', as: 'font', type: 'font/woff2', crossOrigin: '', href: 'https://topclassui.com/_next/static/media/arabic.woff2' },
      { rel: 'preload', as: 'font', type: 'font/woff2', crossOrigin: '', href: 'https://topclassui.com/_next/static/media/latin.woff2' },
    ])
  })

  it('skips the fallback face, which has no file, and a stylesheet it may not read', () => {
    const links = run([
      { href: 'https://cdn.example/other.css', cssRules: 'cross-origin' },
      { href: FONTS_CSS, cssRules: [face('Noto Sans Arabic Fallback', 'local(Arial)', ''), face('Noto Sans Arabic', 'url(/media/all.woff2)', '')] },
    ])
    expect(links.map((link) => link.href)).toEqual(['https://topclassui.com/media/all.woff2'])
  })

  it('adds nothing on a page without the Arabic font', () => {
    expect(run([{ href: FONTS_CSS, cssRules: [face('Inter', 'url(../media/inter.woff2)', 'U+??')] }])).toEqual([])
  })
})
