import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

const classes = (element: Element | null) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe("R-5.2-2: a render element's class follows the part's own and the consumer's, through cn()", () => {
  it('the root, the list, the tab and the panel take the class their element was written with', () => {
    const { container } = render(
      <TabsRoot defaultValue="a" className="grid-cols-2" render={<section className="grid-cols-3" />}>
        <TabsList aria-label="Settings" render={<div className="gap-2" />}>
          <TabsTab value="a" render={<button type="button" className="font-bold" />}>Account</TabsTab>
        </TabsList>
        <TabsPanel value="a" className="mt-2" render={<article className="mt-8" />}>Settings</TabsPanel>
      </TabsRoot>,
    )
    expect(classes(container.querySelector('section'))).toEqual(['grid', 'grid-cols-3'])
    expect(classes(screen.getByRole('tablist'))).toContain('gap-2')
    expect(classes(screen.getByRole('tablist'))).not.toContain('gap-5')
    expect(classes(screen.getByRole('tab'))).toContain('font-bold')
    expect(classes(screen.getByRole('tab'))).not.toContain('font-medium')
    expect(classes(screen.getByRole('tabpanel'))).toContain('mt-8')
    expect(classes(screen.getByRole('tabpanel'))).not.toContain('mt-2')
    expect(classes(screen.getByRole('tabpanel'))).not.toContain('mt-4')
  })
})
