import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { GUIDES } from '../../lib/data'
import { highlight } from '../../lib/highlight'

// A file name, the same in every language, as a fence's title is.
const FILE_NAME = 'index.html'

/** A single-page app's index.html with THEME_SCRIPT pasted above the module script, in the page's own language. */
export function themeScriptHtml(locale: Locale): string {
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  return [
    '<!doctype html>',
    `<html lang="${locale}" dir="${dir}" data-theme="dark">`,
    '  <head>',
    '    <meta charset="UTF-8" />',
    `    <script>${GUIDES.themeScript}</script>`,
    '  </head>',
    '  <body>',
    '    <div id="root"></div>',
    '    <script type="module" src="/src/main.tsx"></script>',
    '  </body>',
    '</html>',
  ].join('\n')
}

export async function ThemeScriptHtml({ locale }: { locale: Locale }) {
  const code = themeScriptHtml(locale)
  const highlighted = await highlight(code, 'html')
  return <CodeBlock {...getLabels(locale)} lang="html" title={FILE_NAME} highlighted={highlighted ?? undefined}>{code}</CodeBlock>
}
