import { CodeBlock } from 'topclassui/code-block'
import { getLabels } from 'topclassui/labels/get-labels'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from 'topclassui/tabs'

import type { Locale } from '../../content/pages'
import { highlight } from '../../lib/highlight'
import { INSTALL_LINE } from '../../lib/site'
import { slugify } from '../../lib/slug'

export interface FrameworkTabsProps {
  locale: Locale
  label: string
  terminal: string
  frameworks: readonly string[]
}

/** One tab per framework over the same install line: the setup is the same on each (docs-site page 2). */
export async function FrameworkTabs({ locale, label, terminal, frameworks }: FrameworkTabsProps) {
  const highlighted = await highlight(INSTALL_LINE, 'bash')
  const tabs = frameworks.map((name) => ({ name, value: slugify(name) }))
  return (
    <TabsRoot defaultValue={tabs[0]?.value ?? ''}>
      <TabsList aria-label={label}>
        {tabs.map((tab) => <TabsTab key={tab.value} value={tab.value}>{tab.name}</TabsTab>)}
      </TabsList>
      {tabs.map((tab) => (
        <TabsPanel key={tab.value} value={tab.value} keepMounted className="pt-3">
          <CodeBlock {...getLabels(locale)} lang="bash" title={terminal} highlighted={highlighted ?? undefined}>{INSTALL_LINE}</CodeBlock>
        </TabsPanel>
      ))}
    </TabsRoot>
  )
}
