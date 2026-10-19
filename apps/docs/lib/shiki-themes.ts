// The Shiki pair (S3, choice 14) in the docs frames' colours, each a Tailwind palette step the contrast test holds to 4.5:1 plus the margin.
import type { ThemeRegistrationRaw } from 'shiki'

interface Palette {
  text: string
  comment: string
  keyword: string
  string: string
  attribute: string
}

/** Tailwind's neutral-50, neutral-400, blue-400, emerald-400 and amber-400: text on a dark ground. */
const DARK_GROUND: Palette = { text: '#fafafa', comment: '#a1a1a1', keyword: '#51a2ff', string: '#00d492', attribute: '#ffb900' }

/** Tailwind's neutral-950, neutral-600, blue-700, emerald-700 and amber-800: text on a light ground. */
const LIGHT_GROUND: Palette = { text: '#0a0a0a', comment: '#525252', keyword: '#1447e6', string: '#007a55', attribute: '#973c00' }

function themeOf(name: string, palette: Palette): ThemeRegistrationRaw {
  return {
    name,
    fg: palette.text,
    bg: 'transparent',
    settings: [
      { settings: { foreground: palette.text } },
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: palette.comment } },
      {
        scope: [
          'keyword.control', 'keyword.other', 'keyword.operator.new', 'keyword.operator.expression', 'storage', 'variable.language',
          'entity.name.tag', 'support.class.component', 'punctuation.definition.tag',
        ],
        settings: { foreground: palette.keyword },
      },
      { scope: ['string', 'punctuation.definition.string', 'string.template'], settings: { foreground: palette.string } },
      { scope: ['entity.other.attribute-name', 'constant.numeric', 'constant.language'], settings: { foreground: palette.attribute } },
    ],
  }
}

/** For a dark ground: the page in dark mode, CodeBlock's own block in light and ocean. */
export const ON_DARK = themeOf('on-dark', DARK_GROUND)
/** For a light ground: the page in light and ocean, CodeBlock's own block in dark. */
export const ON_LIGHT = themeOf('on-light', LIGHT_GROUND)

/** The languages the site's fences and demos use; anything else renders as plain text. */
export const LANGS = ['tsx', 'ts', 'jsx', 'js', 'css', 'bash', 'json', 'html'] as const
