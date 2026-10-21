import type { Locale } from '../../content/pages'
import { GUIDES } from '../../lib/data'
import { CodeFrame } from './code-frame'

/** The CSP source that allows the theme script, its SHA-256 computed by docs:data from the installed package. */
export function ThemeScriptCsp({ locale, title }: { locale: Locale; title: string }) {
  return <CodeFrame code={`Content-Security-Policy: script-src 'self' '${GUIDES.themeScriptHash}'`} locale={locale} title={title} />
}
