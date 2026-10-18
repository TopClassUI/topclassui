import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { highlight } from '../../lib/highlight'
import { INSTALL_LINE } from '../../lib/site'
import { slugify } from '../../lib/slug'
import { CodeTabs } from './mdx-islands'

export interface FrameworkTabsProps {
  locale: Locale
  label: string
  terminal: string
  frameworks: readonly string[]
}

/** One tab per framework over the same install line: the setup is the same on each (docs-site page 2). */
export async function FrameworkTabs({ locale, label, terminal, frameworks }: FrameworkTabsProps) {
  const highlighted = await highlight(INSTALL_LINE, 'bash')
  // One CodeBlock per tab, each rendered here, so each keeps its own title id.
  const tabs = frameworks.map((name) => ({
    name,
    value: slugify(name),
    panel: <CodeBlock {...getLabels(locale)} lang="bash" title={terminal} highlighted={highlighted ?? undefined}>{INSTALL_LINE}</CodeBlock>,
  }))
  return <CodeTabs label={label} tabs={tabs} />
}
