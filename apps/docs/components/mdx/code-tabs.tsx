'use client'

// The tabs of FrameworkTabs and PackageManagers: each panel is a CodeBlock the server rendered, so only the tabs hydrate.
import type { ReactNode } from 'react'
import { BORDER, FOCUS_RING_INSET } from 'topclassui/classes'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from 'topclassui/tabs'

// One card, as the docs frames draw it: the tabs on the surface over a line, the code flush beneath.
const CARD = `docs-tabbed overflow-hidden rounded-box bg-page ${BORDER}`
// The frames run the strip and its hairline under the whole card, where the library's list hugs its tabs.
const LIST = 'w-full max-w-none gap-0 bg-surface'
const TAB = 'h-9.25 px-3.5'
const PANEL = `relative mt-0 ${FOCUS_RING_INSET}`

export interface CodeTabsProps {
  label: string
  tabs: { name: string; value: string; panel: ReactNode }[]
}

export function CodeTabs({ label, tabs }: CodeTabsProps) {
  return (
    <TabsRoot defaultValue={tabs[0]?.value ?? ''} className={CARD}>
      <TabsList aria-label={label} className={LIST}>
        {tabs.map((tab) => <TabsTab key={tab.value} value={tab.value} className={TAB}>{tab.name}</TabsTab>)}
      </TabsList>
      {tabs.map((tab) => (
        <TabsPanel key={tab.value} value={tab.value} keepMounted className={PANEL}>{tab.panel}</TabsPanel>
      ))}
    </TabsRoot>
  )
}
