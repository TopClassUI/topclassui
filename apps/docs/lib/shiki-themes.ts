// The Shiki pair (S3, choice 14) in the docs frames' colours, each a Tailwind palette step the contrast test holds to 4.5:1 plus the margin.
import type { ThemeRegistrationRaw } from 'shiki'

interface Palette {
  text: string
  comment: string
  keyword: string
  string: string
  attribute: string
  tag: string
}

/** Tailwind's neutral-300, neutral-400, blue-400, emerald-400, amber-400 and sky-400: text on a dark ground. */
const DARK_GROUND: Palette = { text: '#d4d4d4', comment: '#a1a1a1', keyword: '#51a2ff', string: '#00d492', attribute: '#ffb900', tag: '#00bcff' }

/** Tailwind's neutral-800, neutral-600, blue-700, emerald-700, amber-800 and sky-700: text on a light ground. */
const LIGHT_GROUND: Palette = { text: '#262626', comment: '#525252', keyword: '#1447e6', string: '#007a55', attribute: '#973c00', tag: '#0069a8' }

/** CSS selectors and units, which the grammars scope as attribute names, tags and keywords; they read as plain text, as drawn. */
const PLAIN_IN_CSS = [
  'entity.other.attribute-name.css', 'entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css',
  'entity.other.attribute-name.pseudo-class.css', 'entity.other.attribute-name.pseudo-element.css', 'entity.name.tag.css', 'keyword.other.unit',
]

function themeOf(name: string, palette: Palette): ThemeRegistrationRaw {
  return {
    name,
    fg: palette.text,
    bg: 'transparent',
    settings: [
      { settings: { foreground: palette.text } },
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: palette.comment } },
      {
        scope: ['keyword.control', 'keyword.other', 'keyword.operator.new', 'keyword.operator.expression', 'storage', 'variable.language', 'constant.language'],
        settings: { foreground: palette.keyword },
      },
      { scope: ['entity.name.tag', 'support.class.component'], settings: { foreground: palette.tag } },
      { scope: ['string', 'punctuation.definition.string', 'string.template'], settings: { foreground: palette.string } },
      { scope: ['entity.other.attribute-name'], settings: { foreground: palette.attribute } },
      { scope: [...PLAIN_IN_CSS, 'string.unquoted.argument'], settings: { foreground: palette.text } },
    ],
  }
}

/** For a dark ground: the page in dark mode, CodeBlock's own block in light and ocean. */
export const ON_DARK = themeOf('on-dark', DARK_GROUND)
/** For a light ground: the page in light and ocean, CodeBlock's own block in dark. */
export const ON_LIGHT = themeOf('on-light', LIGHT_GROUND)

/** The languages the site's fences and demos use; anything else renders as plain text. */
export const LANGS = ['tsx', 'ts', 'jsx', 'js', 'css', 'bash', 'json', 'html', 'text'] as const
