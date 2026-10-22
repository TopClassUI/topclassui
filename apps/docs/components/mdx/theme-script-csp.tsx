import type { Locale } from '../../content/pages'
import { GUIDES } from '../../lib/data'
import { highlight } from '../../lib/highlight'
import { CodeFrame } from './code-frame'

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

/** Headed "code", as an untitled fence is. */
export async function ThemeScriptCsp({ locale, title }: { locale: Locale; title: string }) {
  const code = themeScriptSample()
  const highlighted = await highlight(code, LANG)
  return <CodeFrame code={code} locale={locale} lang={LANG} title={title} highlighted={highlighted} />
}
