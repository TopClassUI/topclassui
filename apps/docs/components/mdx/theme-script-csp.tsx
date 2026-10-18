import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { GUIDES } from '../../lib/data'

/** The CSP source that allows the theme script, its SHA-256 computed by docs:data from the installed package. */
export function ThemeScriptCsp({ locale, title }: { locale: Locale; title: string }) {
  return (
    <CodeBlock {...getLabels(locale)} title={title}>{`Content-Security-Policy: script-src 'self' '${GUIDES.themeScriptHash}'`}</CodeBlock>
  )
}
