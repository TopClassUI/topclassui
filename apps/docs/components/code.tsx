// A highlighted CodeBlock whose copy button is named by what it copies (S11).
import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import { type CodeLang, highlight } from '../lib/highlight'

export interface CodeProps {
  code: string
  /** The file name in the header; it names the code region, so two blocks on a page never share one. */
  title: string
  copyLabel: string
  locale: string
  lang?: CodeLang
}

export async function Code({ code, title, copyLabel, locale, lang = 'tsx' }: CodeProps) {
  const { labels } = getLabels(locale, { common: { copy: copyLabel } })
  return <CodeBlock lang={lang} title={title} labels={labels} highlighted={(await highlight(code, lang)) ?? undefined}>{code}</CodeBlock>
}
