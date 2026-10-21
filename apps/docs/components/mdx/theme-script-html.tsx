import type { Locale } from '../../content/pages'
import { GUIDES } from '../../lib/data'
import { highlight } from '../../lib/highlight'
import { CodeFrame } from './code-frame'

// A file name, the same in every language, as a fence's title is.
const FILE_NAME = 'index.html'

// The minified script runs off the edge on one line, so the page shows where it goes and Copy carries the real one.
const PLACEHOLDER = '/* THEME_SCRIPT from topclassui/theme */'

/** A single-page app's index.html with `script` pasted above the module script, in the page's own language. */
export function themeScriptHtml(locale: Locale, script = GUIDES.themeScript): string {
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  return [
    '<!doctype html>',
    `<html lang="${locale}" dir="${dir}" data-theme="dark">`,
    '  <head>',
    '    <meta charset="UTF-8" />',
    `    <script>${script}</script>`,
    '  </head>',
    '  <body>',
    '    <div id="root"></div>',
    '    <script type="module" src="/src/main.tsx"></script>',
    '  </body>',
    '</html>',
  ].join('\n')
}

export async function ThemeScriptHtml({ locale }: { locale: Locale }) {
  const code = themeScriptHtml(locale, PLACEHOLDER)
  const highlighted = await highlight(code, 'html')
  return <CodeFrame code={code} copy={themeScriptHtml(locale)} locale={locale} lang="html" title={FILE_NAME} highlighted={highlighted} />
}
