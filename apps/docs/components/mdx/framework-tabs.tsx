import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { highlight } from '../../lib/highlight'
import { ADD_LINE, INSTALL_LINE } from '../../lib/site'
import { slugify } from '../../lib/slug'
import { CodeTabs } from './mdx-islands'
import { DOCS_CODE } from '../classes'

export interface FrameworkTabsProps {
  locale: Locale
  label: string
  terminal: string
  frameworks: readonly string[]
}

/** One tab per framework over the same two lines, install then add: the setup is the same on each (docs-site page 2). */
export async function FrameworkTabs({ locale, label, terminal, frameworks }: FrameworkTabsProps) {
  const code = `${INSTALL_LINE}\n${ADD_LINE}`
  const highlighted = await highlight(code, 'bash')
  // One CodeBlock per tab, each rendered here, so each keeps its own title id.
  const tabs = frameworks.map((name) => ({
    name,
    value: slugify(name),
    panel: <CodeBlock className={DOCS_CODE} {...getLabels(locale)} lang="bash" title={terminal} highlighted={highlighted ?? undefined}>{code}</CodeBlock>,
  }))
  return <CodeTabs label={label} tabs={tabs} />
}
