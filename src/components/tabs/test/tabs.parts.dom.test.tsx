import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'

import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'
import type { TabsRootProps } from '../types.js'

/** One root with two tabs, each part marked so a test can find it whatever its role. */
function tabs(root: Partial<TabsRootProps> = {}) {
  return (
    <TabsRoot defaultValue="a" data-testid="root" {...root}>
      <TabsList aria-label="Project" data-testid="list">
        <TabsTab value="a" data-testid="tab">Overview</TabsTab>
        <TabsTab value="b" data-testid="other">Activity</TabsTab>
      </TabsList>
      <TabsPanel value="a" data-testid="panel">Panel</TabsPanel>
      <TabsPanel value="b">Other panel</TabsPanel>
    </TabsRoot>
  )
}

const classes = (id: string) => (screen.getByTestId(id).getAttribute('class') ?? '').split(' ')

describe('the look comes from the nearest root', () => {
  it('tabs nested inside a panel take the look of their own root, not of the one around them', () => {
    render(
      <TabsRoot variant="enclosed" size="lg" defaultValue="outer">
        <TabsList aria-label="Outer"><TabsTab value="outer" data-testid="outer-tab">Outer</TabsTab></TabsList>
        <TabsPanel value="outer">
          <TabsRoot size="xs" defaultValue="inner">
            <TabsList aria-label="Inner" data-testid="inner-list"><TabsTab value="inner" data-testid="inner-tab">Inner</TabsTab></TabsList>
            <TabsPanel value="inner">Inner panel</TabsPanel>
          </TabsRoot>
        </TabsPanel>
      </TabsRoot>,
    )
    expect(classes('outer-tab')).toEqual(expect.arrayContaining(['h-control-lg', 'data-active:bg-surface-raised']))
    expect(classes('inner-tab')).toEqual(expect.arrayContaining(['h-control-xs', 'border-b-2']))
    expect(classes('inner-tab')).not.toContain('data-active:bg-surface-raised')
    expect(classes('inner-list')).toContain('gap-6')
  })
})

describe('the look follows the root when it changes', () => {
  it('a root given another look and size hands them to its list and its tabs on the next render', () => {
    const view = render(tabs({ variant: 'line', size: 'sm' }))
    expect(classes('tab')).toEqual(expect.arrayContaining(['h-control-sm', 'border-b-2']))
    view.rerender(tabs({ variant: 'enclosed', size: 'lg' }))
    expect(classes('tab')).toEqual(expect.arrayContaining(['h-control-lg', 'data-active:bg-surface-raised']))
    expect(classes('tab')).not.toContain('h-control-sm')
    expect(classes('list')).toContain('bg-surface')
    expect(screen.getByTestId('root').getAttribute('data-variant')).toBe('enclosed')
  })

  it('a tab keeps its focus and its place when only the look changes', () => {
    const view = render(tabs({ variant: 'line' }))
    const before = screen.getByTestId('tab')
    view.rerender(tabs({ variant: 'enclosed' }))
    expect(screen.getByTestId('tab')).toBe(before)
  })
})

describe('className, style, ref and the rest reach the element each part renders (R-5.7-3)', () => {
  it('a consumer className is merged last on every part, so it wins a conflict with the part own', () => {
    render(
      <TabsRoot defaultValue="a" className="flex" data-testid="root">
        <TabsList aria-label="Project" className="gap-2" data-testid="list">
          <TabsTab value="a" className="font-bold text-body" data-testid="tab">A</TabsTab>
        </TabsList>
        <TabsPanel value="a" className="mt-8" data-testid="panel">Panel</TabsPanel>
      </TabsRoot>,
    )
    expect(classes('root')).toContain('flex')
    expect(classes('root')).not.toContain('grid')
    expect(classes('list')).toContain('gap-2')
    expect(classes('list')).not.toContain('gap-6')
    expect(classes('tab')).toEqual(expect.arrayContaining(['font-bold', 'text-body']))
    expect(classes('tab')).not.toContain('font-normal')
    expect(classes('tab')).not.toContain('text-muted')
    expect(classes('panel')).toContain('mt-8')
    expect(classes('panel')).not.toContain('mt-4')
  })

  it('a custom tab takes its size from its own className', () => {
    render(
      <TabsRoot size="custom" defaultValue="a">
        <TabsList aria-label="Project"><TabsTab value="a" className="h-14 px-5 text-lg" data-testid="tab">A</TabsTab></TabsList>
        <TabsPanel value="a">Panel</TabsPanel>
      </TabsRoot>,
    )
    expect(classes('tab')).toEqual(expect.arrayContaining(['h-14', 'px-5', 'text-lg']))
  })

  it('a ref on each part is the element it renders', () => {
    const [root, list, tab, panel] = [createRef<HTMLDivElement>(), createRef<HTMLDivElement>(), createRef<HTMLButtonElement>(), createRef<HTMLDivElement>()]
    render(
      <TabsRoot defaultValue="a" ref={root}>
        <TabsList aria-label="Project" ref={list}><TabsTab value="a" ref={tab}>A</TabsTab></TabsList>
        <TabsPanel value="a" ref={panel}>Panel</TabsPanel>
      </TabsRoot>,
    )
    expect(root.current?.getAttribute('data-variant')).toBe('line')
    expect(list.current?.getAttribute('role')).toBe('tablist')
    expect(tab.current?.getAttribute('role')).toBe('tab')
    expect(panel.current?.getAttribute('role')).toBe('tabpanel')
  })

  it('a style and any other attribute land on the element of the part they were written on', () => {
    render(
      <TabsRoot defaultValue="a" id="root" style={{ ['--tc-radius' as string]: '0px' }} data-testid="root">
        <TabsList aria-label="Project" id="list" title="The list" data-testid="list">
          <TabsTab value="a" id="tab" title="The tab" data-testid="tab">A</TabsTab>
        </TabsList>
        <TabsPanel value="a" id="panel" title="The panel" data-testid="panel">Panel</TabsPanel>
      </TabsRoot>,
    )
    expect(screen.getByTestId('root').getAttribute('style')).toContain('--tc-radius')
    expect(screen.getByTestId('root').id).toBe('root')
    expect(screen.getByTestId('list').getAttribute('title')).toBe('The list')
    expect(screen.getByTestId('tab').getAttribute('title')).toBe('The tab')
    expect(screen.getByTestId('tab').id).toBe('tab')
    expect(screen.getByTestId('panel').getAttribute('title')).toBe('The panel')
    expect(screen.getByTestId('panel').id).toBe('panel')
  })

  it('tabIndex={-1} on a panel takes it out of the tab order, for one that starts with a control', () => {
    render(
      <TabsRoot defaultValue="a">
        <TabsList aria-label="Project"><TabsTab value="a">A</TabsTab></TabsList>
        <TabsPanel value="a" tabIndex={-1} data-testid="panel"><button type="button">Inside</button></TabsPanel>
      </TabsRoot>,
    )
    expect(screen.getByTestId('panel').getAttribute('tabindex')).toBe('-1')
  })
})
