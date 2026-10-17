import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem } from '../types.js'

const TRAIL: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { label: 'Breadcrumb' },
]

describe('in a real tree', () => {
  it('is a navigation landmark named Breadcrumb', () => {
    render(<Breadcrumb items={TRAIL} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' }).tagName).toBe('NAV')
  })

  it('holds one list with one item per crumb, inside the landmark', () => {
    render(<Breadcrumb items={TRAIL} />)
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    const list = within(nav).getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  })

  it('exposes each linked crumb as a link named by its label alone, with no separator in the name', () => {
    render(<Breadcrumb items={TRAIL} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/')
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/docs')
  })

  it('marks the last crumb as the current page, and it is not a link', () => {
    render(<Breadcrumb items={TRAIL} />)
    const current = screen.getByText('Breadcrumb')
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(current.tagName).toBe('SPAN')
    expect(screen.queryByRole('link', { name: 'Breadcrumb' })).toBeNull()
  })

  it('keeps the separators out of the accessibility tree', () => {
    const { container } = render(<Breadcrumb items={TRAIL} />)
    expect(screen.queryByRole('img')).toBeNull()
    const carets = container.querySelectorAll('svg')
    expect(carets).toHaveLength(2)
    for (const caret of carets) expect(caret.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders nothing at all for an empty trail', () => {
    const { container } = render(<Breadcrumb items={[]} />)
    expect(container.innerHTML).toBe('')
    expect(screen.queryByRole('navigation')).toBeNull()
  })
})

describe('keyboard', () => {
  it('stops Tab on each link in order and skips the current page', async () => {
    render(<><Breadcrumb items={TRAIL} /><button type="button">After</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Home' }))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Docs' }))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }))
  })

  it('walks back through the links with Shift+Tab', async () => {
    render(<><Breadcrumb items={TRAIL} /><button type="button">After</button></>)
    screen.getByRole('button', { name: 'After' }).focus()
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Docs' }))
  })

  it('is not a tab stop when no crumb is a link', async () => {
    render(<><Breadcrumb items={[{ label: 'Home' }, { label: 'Docs' }]} /><button type="button">After</button></>)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }))
  })
})

describe('the structured data in the document', () => {
  const script = (container: HTMLElement) => container.querySelector('script[type="application/ld+json"]')

  it('is one data block a JSON parser reads back as the linked crumbs', () => {
    const { container } = render(<Breadcrumb items={TRAIL} />)
    expect(container.querySelectorAll('script')).toHaveLength(1)
    expect(JSON.parse(script(container)?.textContent ?? '{}')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Docs', item: '/docs' },
      ],
    })
  })

  it('sits inside the nav, so the root stays a single element', () => {
    const { container } = render(<Breadcrumb items={TRAIL} />)
    expect(container.children).toHaveLength(1)
    expect(script(container)?.parentElement?.tagName).toBe('NAV')
  })

  it('parses a server-rendered hostile label as data: one script, no injected element', () => {
    const hostile = '</script><img src=x onerror=alert(1)><script>'
    const { container } = render(<Breadcrumb items={[{ href: '/x', label: hostile }, { label: 'Now' }]} />)
    // Parsed again from the serialised HTML, which is what a browser does with a server response.
    const reparsed = document.createElement('div')
    reparsed.innerHTML = container.innerHTML
    expect(reparsed.querySelectorAll('script')).toHaveLength(1)
    expect(reparsed.querySelectorAll('img')).toHaveLength(0)
    const data = JSON.parse(script(reparsed)?.textContent ?? '{}') as { itemListElement: { name: string }[] }
    expect(data.itemListElement[0]?.name).toBe('</script><img src=x onerror=alert(1)><script>')
    expect(reparsed.querySelector('a')?.textContent).toBe('</script><img src=x onerror=alert(1)><script>')
  })
})

describe('ref and rest', () => {
  it('ref is a normal prop and receives the nav', () => {
    const ref = { current: null as HTMLElement | null }
    render(<Breadcrumb ref={ref} items={TRAIL} />)
    expect(ref.current?.tagName).toBe('NAV')
    expect(ref.current?.getAttribute('aria-label')).toBe('Breadcrumb')
  })

  it('is cleared on unmount', () => {
    const ref = { current: null as HTMLElement | null }
    const { unmount } = render(<Breadcrumb ref={ref} items={TRAIL} />)
    unmount()
    expect(ref.current).toBeNull()
  })

  it('lets a click on a link through, because the trail swallows no event', async () => {
    const hrefs: (string | null)[] = []
    render(
      <Breadcrumb
        items={TRAIL}
        onClick={(event) => {
          event.preventDefault()
          hrefs.push((event.target as HTMLElement).closest('a')?.getAttribute('href') ?? null)
        }}
      />,
    )
    await userEvent.click(screen.getByRole('link', { name: 'Docs' }))
    expect(hrefs).toEqual(['/docs'])
  })
})
