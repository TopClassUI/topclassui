'use client'

// The tabs of FrameworkTabs and PackageManagers: each panel is a CodeBlock the server rendered, so only the tabs hydrate.
import type { ReactNode } from 'react'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from 'topclassui/tabs'

export interface CodeTabsProps {
  label: string
  tabs: { name: string; value: string; panel: ReactNode }[]
}

export function CodeTabs({ label, tabs }: CodeTabsProps) {
  return (
    <TabsRoot defaultValue={tabs[0]?.value ?? ''}>
      <TabsList aria-label={label}>
        {tabs.map((tab) => <TabsTab key={tab.value} value={tab.value}>{tab.name}</TabsTab>)}
      </TabsList>
      {tabs.map((tab) => (
        <TabsPanel key={tab.value} value={tab.value} keepMounted className="pt-3">{tab.panel}</TabsPanel>
      ))}
    </TabsRoot>
  )
}
