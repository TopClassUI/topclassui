import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { house } from '#icons/data/house.js'
import { Svg } from '#components/svg/index.js'
import { attr, classList, markup } from '#test/markup.js'
import { SidebarGroup, SidebarLink } from '../index.js'

/** The opening tag of the first element of a kind: its attributes, as the server writes them. */
const tag = (html: string, name: string) => new RegExp(`<${name}[ >][^>]*>|<${name}>`).exec(html)?.[0] ?? ''

const icon = <Svg icon={house} />

/** Stands in for next/link, which is not a dependency: a component that requires an href. */
function Link({ href, children, ...rest }: { href: string, children?: ReactNode, className?: string }) {
  return <a href={href} data-framework="" {...rest}>{children}</a>
}

// None of these parts reads the rail: each renders with no SidebarRoot around it, as a Server Component must.
describe('SidebarGroup on the server', () => {
  it('is a div holding a paragraph and the list it names, through an id React makes', () => {
    const html = markup(<SidebarGroup label="Workspace"><a href="#row">Row</a></SidebarGroup>)
    expect(html).toMatch(/^<div class="[^"]*"><p id="[^"]+" dir="auto" class="[^"]*">Workspace<\/p><ul role="list" aria-labelledby="[^"]+" class="[^"]*"><li><a href="#row">Row<\/a><\/li><\/ul><\/div>$/)
    expect(attr(tag(html, 'ul'), 'aria-labelledby')).toBe(attr(tag(html, 'p'), 'id'))
    expect(attr(tag(html, 'p'), 'id')?.length).toBeGreaterThan(1)
  })

  it('gives two groups two ids, so each list is named by its own label', () => {
    const html = markup(<><SidebarGroup label="Workspace" /><SidebarGroup label="Account" /></>)
    const ids = [...html.matchAll(/<p id="([^"]+)"/g)].map((match) => match[1])
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    expect([...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((match) => match[1])).toEqual(ids)
  })

  it('with no label, a false or an empty one it is a bare list: no paragraph, and no name that points nowhere', () => {
    for (const label of [undefined, null, false, '']) {
      const html = markup(<SidebarGroup label={label}><a href="#row">Row</a></SidebarGroup>)
      expect(html, String(label)).toMatch(/^<div class="[^"]*"><ul role="list" class="[^"]*"><li><a href="#row">Row<\/a><\/li><\/ul><\/div>$/)
    }
  })

  it('keeps the list role Preflight costs it in Safari, and gives each row a list item of its own', () => {
    const html = markup(<SidebarGroup><SidebarLink href="/a">A</SidebarLink>{null}{false}<SidebarLink href="/b">B</SidebarLink></SidebarGroup>)
    expect(html.match(/<ul role="list"[^>]*><li><a /g)).toHaveLength(1)
    expect(html.match(/<li>/g)).toHaveLength(2)
    expect(html.match(/<\/a><\/li>/g)).toHaveLength(2)
  })

  it('cuts a label of 300 characters at 100, and leaves an element as it came', () => {
    expect(markup(<SidebarGroup label={'W'.repeat(300)} />)).toContain(`>${'W'.repeat(100)}</p>`)
    expect(markup(<SidebarGroup label={<b>{'W'.repeat(300)}</b>} />)).toContain(`<b>${'W'.repeat(300)}</b>`)
  })

  it('passes its props to the div around the two, and merges className last', () => {
    const div = tag(markup(<SidebarGroup id="group" data-testid="group" className="gap-3" label="Workspace" />), 'div')
    expect(attr(div, 'id')).toBe('group')
    expect(attr(div, 'data-testid')).toBe('group')
    expect(classList(div).at(-1)).toBe('gap-3')
    expect(classList(div)).not.toContain('gap-0.5')
  })
})

describe('SidebarLink on the server', () => {
  const row = (props: Partial<Parameters<typeof SidebarLink>[0]> = {}, label: ReactNode = 'Home') =>
    markup(<SidebarLink href="/home" icon={icon} {...props}>{label}</SidebarLink>)

  it('is a real link: the icon in a span, then the label in a span of its own', () => {
    expect(row()).toMatch(/^<a class="[^"]*" href="\/home"><span class="[^"]*"><svg [^>]*><path [^>]*><\/path><\/svg><\/span><span dir="auto" class="[^"]*">Home<\/span><\/a>$/)
  })

  it('every prop goes to the link, the element it returns', () => {
    const html = row({ id: 'home', target: '_blank', rel: 'noreferrer', lang: 'en', ...{ 'data-testid': 'home' } })
    expect(html.startsWith('<a ')).toBe(true)
    const link = tag(html, 'a')
    expect([attr(link, 'id'), attr(link, 'target'), attr(link, 'rel'), attr(link, 'lang'), attr(link, 'data-testid')]).toEqual(['home', '_blank', 'noreferrer', 'en', 'home'])
  })

  it('marks the page being read with aria-current="page", and writes no aria-current on any other row', () => {
    expect(attr(tag(row({ current: true }), 'a'), 'aria-current')).toBe('page')
    expect(row()).not.toContain('aria-current')
    expect(row({ current: false })).not.toContain('aria-current')
  })

  // JSX lets a hyphenated attribute past the type. A row announced as current and drawn as any other would lie to one reader.
  it('current alone decides aria-current: one written by hand on a row that is not current is not kept', () => {
    expect(markup(<SidebarLink href="/home" aria-current="page">Home</SidebarLink>)).not.toContain('aria-current')
    expect(attr(tag(markup(<SidebarLink href="/home" current aria-current="step">Home</SidebarLink>), 'a'), 'aria-current')).toBe('page')
  })

  it('the icon is decorative, so the label alone is the name of the link', () => {
    const html = row()
    expect(attr(tag(html, 'svg'), 'aria-hidden')).toBe('true')
    expect(html.replace(/<[^>]+>/g, '')).toBe('Home')
  })

  it('with no icon it writes no wrapper for one, and with no label no span for one', () => {
    expect(markup(<SidebarLink href="/home">Home</SidebarLink>)).toMatch(/^<a class="[^"]*" href="\/home"><span dir="auto" class="[^"]*">Home<\/span><\/a>$/)
    expect(markup(<SidebarLink href="/home" icon={false}>Home</SidebarLink>).match(/<span/g)).toHaveLength(1)
    expect(markup(<SidebarLink href="/home" icon={icon} aria-label="Home" />)).toMatch(/^<a class="[^"]*" href="\/home" aria-label="Home"><span class="[^"]*"><svg [^>]*><path [^>]*><\/path><\/svg><\/span><\/a>$/)
  })

  it('cuts a label of 300 characters at 100; a label made of elements keeps all of its text for a screen reader', () => {
    expect(row({}, 'W'.repeat(300))).toContain(`>${'W'.repeat(100)}</span></a>`)
    expect(row({}, <><strong>Bold</strong> and <em>{'W'.repeat(300)}</em></>)).toContain(`<strong>Bold</strong> and <em>${'W'.repeat(300)}</em></span></a>`)
  })

  it('merges className last on the link', () => {
    const link = tag(row({ className: 'text-muted' }), 'a')
    expect(classList(link).at(-1)).toBe('text-muted')
    expect(classList(link)).not.toContain('text-body')
  })
})

describe('SidebarLink with render (R-5.7-4)', () => {
  it('renders the element it was given, with the href and the attributes that element was written with', () => {
    const html = markup(<SidebarLink render={<Link href="/docs" />} icon={icon} current>Docs</SidebarLink>)
    expect(html).toMatch(/^<a href="\/docs" data-framework="" class="[^"]*" aria-current="page"><span class="[^"]*"><svg [^>]*><path [^>]*><\/path><\/svg><\/span><span dir="auto" class="[^"]*">Docs<\/span><\/a>$/)
  })

  it('an element written with its own children keeps them, inside the label that can hide, with the icon before it', () => {
    const html = markup(<SidebarLink render={<Link href="/docs">Docs</Link>} icon={icon} />)
    expect(html).toMatch(/<\/svg><\/span><span dir="auto" class="[^"]*">Docs<\/span><\/a>$/)
    expect(html.match(/<span/g)).toHaveLength(2)
  })

  // renderElement lets the props of the element win, its class too: what is written on the element is the most explicit.
  it("the caller's className is merged after the row's, and the class of the element itself after both", () => {
    const link = tag(markup(<SidebarLink render={<Link href="/docs" className="text-muted" />} className="px-4">Docs</SidebarLink>), 'a')
    expect(classList(link).slice(-2)).toEqual(['px-4', 'text-muted'])
    expect(classList(link)).not.toContain('px-3')
    expect(classList(link)).not.toContain('text-body')
  })

  it('takes a button for a row that is an action', () => {
    const html = markup(<SidebarLink render={<button type="button" />} icon={icon}>Sign out</SidebarLink>)
    expect(html).toMatch(/^<button type="button" class="[^"]*"><span /)
    expect(html).not.toContain('<a')
  })

  it('throws on a render that is not an element, in the words of renderElement', () => {
    expect(() => markup(<SidebarLink render={'a' as never}>Docs</SidebarLink>)).toThrow('render must be an element')
    expect(() => markup(<SidebarLink render={<></>}>Docs</SidebarLink>)).toThrow('not a fragment')
  })
})

describe('the label, the title and the group label take their own direction only when written in one', () => {
  const html = markup(
    <SidebarGroup label="Settings">
      <SidebarLink href="/a" icon={icon}>Projects</SidebarLink>
      <SidebarLink href="/b" icon={icon}>Wi-Fi متصل</SidebarLink>
      <SidebarLink href="/c" icon={icon}><strong>Bold</strong> label</SidebarLink>
    </SidebarGroup>,
  )

  it('an English group label and link label in an Arabic rail carry dir="auto", so a cut one keeps its start', () => {
    expect(html).toMatch(/<p id="[^"]+" dir="auto" class="[^"]*">Settings<\/p>/)
    expect(html).toMatch(/<span dir="auto" class="[^"]*">Projects<\/span>/)
  })

  it('a label in two scripts, or one that holds an element, carries no dir and follows the rail', () => {
    expect(html).toMatch(/<\/span><span class="[^"]*">Wi-Fi متصل<\/span>/)
    expect(html).toMatch(/<\/span><span class="[^"]*"><strong>Bold<\/strong> label<\/span>/)
    expect(markup(<SidebarGroup label="Wi-Fi متصل" />)).toMatch(/<p id="[^"]+" class="[^"]*">Wi-Fi متصل<\/p>/)
  })
})
