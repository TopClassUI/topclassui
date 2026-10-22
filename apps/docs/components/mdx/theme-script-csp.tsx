import type { Locale } from '../../content/pages'
import { GUIDES } from '../../lib/data'
import { highlight } from '../../lib/highlight'
import { CodeFrame } from './code-frame'

// A language name, the same in every locale, as an untitled fence's header is.
const LANG = 'tsx'

/** The ThemeScript sample with the CSP source that allows it, its SHA-256 computed by docs:data from the installed package. */
export function themeScriptSample(hash = GUIDES.themeScriptHash): string {
  return [
    "import { ThemeScript } from 'topclassui/theme'",
    '',
    '<head><ThemeScript /></head>',
    '',
    `// CSP: script-src 'self' '${hash}'`,
  ].join('\n')
}

export async function ThemeScriptCsp({ locale }: { locale: Locale }) {
  const code = themeScriptSample()
  const highlighted = await highlight(code, LANG)
  return <CodeFrame code={code} locale={locale} lang={LANG} title={LANG} highlighted={highlighted} />
}
