import { render, screen } from '@testing-library/react'
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

describe('the root', () => {
  it('reports the look as attributes, with the defaults when none is given', () => {
    render(tabs())
    expect(screen.getByTestId('root').getAttribute('data-variant')).toBe('line')
    expect(screen.getByTestId('root').getAttribute('data-size')).toBe('md')
  })

  it('reports the look it was given', () => {
    render(tabs({ variant: 'enclosed', size: 'lg' }))
    expect(screen.getByTestId('root').getAttribute('data-variant')).toBe('enclosed')
    expect(screen.getByTestId('root').getAttribute('data-size')).toBe('lg')
  })

  it('is a grid of one column that can shrink, so a list that scrolls cannot widen what holds it', () => {
    render(tabs())
    expect(classes('root')).toEqual(['grid', 'grid-cols-1'])
  })

  it('writes the look on itself only: the list, the tabs and the panels take it from context', () => {
    render(tabs({ variant: 'enclosed', size: 'lg' }))
    for (const id of ['list', 'tab', 'panel']) {
      expect(screen.getByTestId(id).hasAttribute('data-variant'), id).toBe(false)
      expect(screen.getByTestId(id).hasAttribute('data-size'), id).toBe(false)
    }
  })
})

describe('the line look, the default', () => {
  it('the list is a row that scrolls sideways inside itself and is the offset parent of its tabs', () => {
    render(tabs())
    expect(classes('list')).toEqual(expect.arrayContaining([
      'relative', 'scroll-px-px', 'flex', 'items-center', 'gap-6', 'px-px', 'overflow-x-auto', 'overscroll-x-contain',
    ]))
  })

  it('the line under the list is a shadow inside it, and a border only under forced colours', () => {
    render(tabs())
    expect(classes('list')).toEqual(expect.arrayContaining([
      'shadow-[inset_0_calc(var(--tc-line-width)*-1)_var(--tc-line)]', 'forced-colors:border-b-(length:--tc-line-width)',
    ]))
    expect(classes('list').filter((cls) => cls.startsWith('border-'))).toEqual([])
  })

  it('a tab carries a bar that only the active one colours, in the primary colour', () => {
    render(tabs())
    expect(classes('tab')).toEqual(expect.arrayContaining(['border-b-2', 'border-transparent', 'data-active:border-primary-solid']))
    expect(classes('tab')).not.toContain('data-active:bg-surface-raised')
  })

  it('under forced colours the bar of a tab that is not active is the page, and the active one the highlight', () => {
    render(tabs())
    expect(classes('tab')).toEqual(expect.arrayContaining(['forced-colors:border-[Canvas]', 'forced-colors:data-active:border-[Highlight]']))
  })
})

describe('the enclosed look', () => {
  it('the list is a tinted box as wide as its tabs and no wider than its parent, with an edge under forced colours', () => {
    render(tabs({ variant: 'enclosed' }))
    expect(classes('list')).toEqual(expect.arrayContaining([
      'relative', 'scroll-px-px', 'flex', 'w-fit', 'max-w-full', 'items-center', 'gap-1', 'rounded-control', 'bg-surface', 'p-1',
      'forced-colors:outline-(length:--tc-line-width)', 'overflow-x-auto', 'overscroll-x-contain',
    ]))
    expect(classes('list')).not.toContain('gap-6')
  })

  it('the active tab is lifted onto the raised surface, and carries no bar', () => {
    render(tabs({ variant: 'enclosed' }))
    expect(classes('tab')).toEqual(expect.arrayContaining(['rounded-control', 'data-active:bg-surface-raised', 'data-active:shadow-sm']))
    expect(classes('tab')).not.toContain('border-b-2')
  })

  it('under forced colours the active tab paints the system pair itself, with a ring that shows on it', () => {
    render(tabs({ variant: 'enclosed' }))
    expect(classes('tab')).toEqual(expect.arrayContaining([
      'forced-colors:data-active:forced-color-adjust-none', 'forced-colors:data-active:bg-[Highlight]',
      'forced-colors:data-active:text-[HighlightText]', 'forced-colors:data-active:shadow-none',
      'forced-colors:data-active:[--tc-ring:HighlightText]',
    ]))
  })
})

describe('a tab of either look', () => {
  for (const variant of ['line', 'enclosed'] as const) {
    it(`${variant}: is muted and medium at rest, and takes the body colour and the semibold weight when active`, () => {
      render(tabs({ variant }))
      expect(classes('tab')).toEqual(expect.arrayContaining(['font-medium', 'text-muted', 'data-active:font-semibold', 'data-active:text-body']))
    })

    it(`${variant}: never shrinks, never wraps and is never wider than its list, and clips what it holds`, () => {
      render(tabs({ variant }))
      expect(classes('tab')).toEqual(expect.arrayContaining([
        'inline-flex', 'shrink-0', 'items-center', 'justify-center-safe', 'gap-2', 'overflow-hidden', 'whitespace-nowrap', 'max-w-full',
      ]))
    })

    it(`${variant}: draws its ring inside its own box, because the list clips`, () => {
      render(tabs({ variant }))
      expect(classes('tab')).toEqual(expect.arrayContaining([
        'outline-none', 'focus-visible:outline-solid', 'focus-visible:outline-(length:--tc-ring-width)',
        'focus-visible:-outline-offset-(length:--tc-ring-width)', 'focus-visible:outline-ring',
      ]))
      expect(classes('tab')).not.toContain('focus-visible:outline-offset-(length:--tc-ring-offset)')
    })

    it(`${variant}: is a target of 24 px, and of 44 px under a finger`, () => {
      render(tabs({ variant }))
      expect(classes('tab')).toEqual(expect.arrayContaining([
        'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
        'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      ]))
    })

    it(`${variant}: when disabled, dims what it holds and not itself, so its ring keeps its contrast`, () => {
      render(tabs({ variant }))
      expect(classes('tab')).toEqual(expect.arrayContaining([
        'data-disabled:pointer-events-none', 'data-disabled:*:opacity-50', 'forced-colors:data-disabled:*:opacity-100',
        'forced-colors:data-disabled:not-data-active:text-[GrayText]',
      ]))
      expect(classes('tab')).not.toContain('data-disabled:opacity-50')
    })
  }
})

describe('size', () => {
  const SIZE = {
    xs: ['h-control-xs', 'px-pad-x-xs', 'text-xs'],
    sm: ['h-control-sm', 'px-pad-x-sm', 'text-sm'],
    md: ['h-control-md', 'px-pad-x-md', 'text-sm'],
    lg: ['h-control-lg', 'px-pad-x-lg', 'text-base'],
    xl: ['h-control-xl', 'px-pad-x-xl', 'text-base'],
  } as const

  for (const [size, expected] of Object.entries(SIZE)) {
    it(`${size}: every tab takes the height, the padding and the type step of the scale`, () => {
      render(tabs({ size: size as keyof typeof SIZE }))
      expect(classes('tab')).toEqual(expect.arrayContaining([...expected]))
      expect(classes('other')).toEqual(expect.arrayContaining([...expected]))
    })
  }

  it('custom: a tab takes no height, no padding and no type step (R-5.7-2)', () => {
    render(tabs({ size: 'custom' }))
    expect(classes('tab').filter((cls) => /^(h-|px-|text-(xs|sm|base|lg))/.test(cls))).toEqual([])
  })

  it('the list and the panel are the same at every size', () => {
    const { unmount } = render(tabs({ size: 'xs' }))
    const [list, panel] = [classes('list'), classes('panel')]
    unmount()
    render(tabs({ size: 'xl' }))
    expect(classes('list')).toEqual(list)
    expect(classes('panel')).toEqual(panel)
  })
})

describe('the panel', () => {
  it('keeps its distance from the list by a margin, breaks a long word and shows the ring outside its box', () => {
    render(tabs())
    expect(classes('panel')).toEqual([
      'mt-4', 'wrap-anywhere', 'outline-none', 'focus-visible:outline-solid', 'focus-visible:outline-(length:--tc-ring-width)',
      'focus-visible:outline-offset-(length:--tc-ring-offset)', 'focus-visible:outline-ring',
    ])
  })
})
