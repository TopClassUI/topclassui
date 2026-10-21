import type { AnchorHTMLAttributes } from 'react'
import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Breadcrumb } from '../index.js'
import type { BreadcrumbItem, BreadcrumbProps } from '../types.js'

const TRAIL: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { label: 'Settings' },
  { href: '/settings/profile', label: 'Profile' },
  { label: 'Avatar' },
]

const html = (props: Partial<BreadcrumbProps> = {}) => markup(<Breadcrumb items={TRAIL} {...props} />)

/** A stand-in for next/link: it renders the anchor and marks it, so a test sees who rendered it. */
function Link({ prefetch, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean }) {
  return <a data-client-link="" data-prefetch={String(prefetch)} {...rest} />
}

/** The opening tag of every anchor, in document order. */
const anchors = (out: string) => out.match(/<a [^>]*>/g) ?? []

const script = (out: string) => /<script[^>]*>.*<\/script>/.exec(out)?.[0]

describe('with no link element', () => {
  it('renders two plain anchors, which reload the document in Next.js', () => {
    expect(anchors(html())).toHaveLength(2)
    expect(html()).not.toContain('data-client-link')
    expect(anchors(html()).map((tag) => attr(tag, 'href'))).toEqual(['/', '/settings/profile'])
  })

  it('writes the anchor as it did before link existed: the href, then the class, then the label', () => {
    expect(html()).toContain('<a href="/" class="inline-flex items-center justify-center gap-1.5 rounded-chip text-muted ')
    expect(html()).toContain('"><span dir="auto" class="truncate min-w-0">Home</span></a></li>')
    expect(html()).not.toMatch(/<a class=/)
  })

  it('renders the same markup when the element passed is a bare anchor', () => {
    expect(html({ link: <a /> })).toBe(html())
  })
})

describe('with link={<Link href="" />} (PLAN 5.8)', () => {
  const linked = html({ link: <Link href="" /> })

  it('renders every crumb link through that element, so a click is a client navigation', () => {
    expect(anchors(linked)).toHaveLength(2)
    expect(anchors(linked).filter((tag) => tag.includes('data-client-link=""'))).toHaveLength(2)
  })

  it('replaces the href the element came with by the href of each item', () => {
    expect(anchors(linked).map((tag) => attr(tag, 'href'))).toEqual(['/', '/settings/profile'])
  })

  // renderElement lets the element's own props win, so an href merged late would be lost.
  it('replaces a real placeholder too, or every crumb would lead to one address', () => {
    const placed = html({ link: <Link href="/placeholder" /> })
    expect(anchors(placed).map((tag) => attr(tag, 'href'))).toEqual(['/', '/settings/profile'])
    expect(placed).not.toContain('href="/placeholder"')
  })

  it('still holds each label in its own truncating span, inside the element', () => {
    expect(linked).toContain('"><span dir="auto" class="truncate min-w-0">Home</span></a></li>')
    expect(linked).toContain('"><span dir="auto" class="truncate min-w-0">Profile</span></a></li>')
  })

  it('gives every link the look of a crumb: the colour, the containment, the floor and the ring', () => {
    for (const tag of anchors(linked)) {
      const list = (attr(tag, 'class') ?? '').split(' ')
      expect(list).toContain('text-muted')
      expect(list).toContain('max-w-full')
      expect(list).toContain('min-h-[var(--tc-target-min,24px)]')
      expect(list).toContain('pointer-coarse:min-h-[var(--tc-target-coarse,44px)]')
      expect(list).toContain('focus-visible:outline-ring')
    }
  })

  it('keeps what the caller put on the element: a prop of its own and a class', () => {
    const own = html({ link: <Link href="" prefetch={false} className="underline" /> })
    expect(anchors(own)).toHaveLength(2)
    for (const tag of anchors(own)) {
      expect(attr(tag, 'data-prefetch')).toBe('false')
      expect((attr(tag, 'class') ?? '').split(' ')).toContain('underline')
      expect((attr(tag, 'class') ?? '').split(' ')).toContain('text-muted')
    }
  })

  it('lets a class on the element win a conflict with the crumb, as className does on the nav', () => {
    const own = html({ link: <Link href="" className="text-body" /> })
    for (const tag of anchors(own)) {
      expect((attr(tag, 'class') ?? '').split(' ')).toContain('text-body')
      expect((attr(tag, 'class') ?? '').split(' ')).not.toContain('text-muted')
    }
  })

  it('leaves the current page and a crumb with no href as spans, since neither is a link', () => {
    expect(linked).toContain('<span dir="auto" class="truncate min-w-0 text-muted">Settings</span></li>')
    expect(linked).toContain('<span dir="auto" aria-current="page" class="truncate min-w-0 text-body font-semibold">Avatar</span></li>')
    expect(linked.match(/<span [^>]*data-client-link/g)).toBeNull()
  })

  it('never writes the element onto the nav', () => {
    expect(linked.startsWith('<nav aria-label="Breadcrumb" class="text-sm"><ol ')).toBe(true)
    expect(html().startsWith('<nav aria-label="Breadcrumb" class="text-sm"><ol ')).toBe(true)
  })

  it('reads the JSON-LD from the items, so it is the same list whichever element renders', () => {
    expect(script(html({ link: <Link href="" />, siteUrl: 'https://example.com' }))).toBe(
      '<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":['
      + '{"@type":"ListItem","position":1,"name":"Home","item":"https://example.com/"},'
      + '{"@type":"ListItem","position":2,"name":"Profile","item":"https://example.com/settings/profile"},'
      + '{"@type":"ListItem","position":3,"name":"Avatar"}]}</script>',
    )
    expect(script(html({ link: <Link href="/placeholder" />, siteUrl: 'https://example.com' }))).not.toContain('placeholder')
  })
})

describe('a link that is not an element', () => {
  it('is refused by the name of the prop and of the component, before React fails on it', () => {
    const notAnElement = 'a' as unknown as BreadcrumbProps['link']
    expect(() => html({ link: notAnElement })).toThrow(TypeError)
    expect(() => html({ link: notAnElement })).toThrow('Breadcrumb: link must be an element, such as link={<Link href="" />}')
  })

  it('says the same for the component passed whole, which is the usual slip: link={Link}', () => {
    const component = Link as unknown as BreadcrumbProps['link']
    expect(() => html({ link: component })).toThrow('Breadcrumb: link must be an element')
  })
})
