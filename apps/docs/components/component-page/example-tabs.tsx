'use client'

// One example's Preview and Code tabs (page 14): the panels are the server's HTML, passed in, so only the tabs hydrate.
import type { ReactNode } from 'react'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from 'topclassui/tabs'

export interface ExampleTabsProps {
  caption: ReactNode
  label: string
  names: { preview: string; code: string }
  preview: ReactNode
  code: ReactNode
}

export function ExampleTabs({ caption, label, names, preview, code }: ExampleTabsProps) {
  return (
    <TabsRoot defaultValue="preview" size="sm" className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {caption}
        <TabsList aria-label={label}>
          <TabsTab value="preview">{names.preview}</TabsTab>
          <TabsTab value="code">{names.code}</TabsTab>
        </TabsList>
      </div>
      <TabsPanel value="preview" keepMounted className="min-w-0">{preview}</TabsPanel>
      <TabsPanel value="code" keepMounted className="min-w-0">{code}</TabsPanel>
    </TabsRoot>
  )
}
