import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { arrowLeft } from '#icons/data/arrow-left.js'
import { check } from '#icons/data/check.js'
import { Svg } from '#components/svg/index.js'
import { Icon, registerIcons, registeredIcons } from '../index.js'

registerIcons({ 'arrow-left': arrowLeft, check })

const markup = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el)
const attr = (html: string, name: string) => new RegExp(`${name}="([^"]*)"`).exec(html)?.[1]

afterEach(() => { vi.restoreAllMocks() })

describe('registerIcons', () => {
  it('registers what it is given and nothing else', () => {
    const names = registeredIcons()
    expect(names.has('arrow-left')).toBe(true)
    expect(names.has('check')).toBe(true)
    expect(names.has('tray')).toBe(false)
  })

  it('ignores an explicit undefined, which a generated file may contain', () => {
    registerIcons({ gear: undefined })
    expect(registeredIcons().has('gear')).toBe(false)
  })
})

describe('<Icon> from the registry', () => {
  it('renders exactly what <Svg> renders for the same icon, so the twins cannot drift', () => {
    for (const props of [{}, { size: 'lg' as const }, { label: 'Back' }, { className: 'text-muted' }]) {
      expect(markup(<Icon name="arrow-left" {...props} />))
        .toBe(markup(<Svg icon={arrowLeft} {...props} />))
    }
  })

  it('inlines the path, so nothing is fetched', () => {
    const html = markup(<Icon name="check" />)
    expect(html).toContain(`d="${check.path}"`)
    expect(html).toContain('fill="currentColor"')
  })

  it('renders an empty svg at the resolved size when a name is not registered', () => {
    const html = markup(<Icon name="tray" size="lg" />)
    expect(html).not.toContain('<path')
    expect(attr(html, 'width')).toBe('32')
    expect(attr(html, 'height')).toBe('32')
  })

  it('warns once per missing name in development, not on every render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    markup(<Icon name="palette" />)
    markup(<Icon name="palette" />)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toMatch(/not registered/)
  })
})

describe('the accessibility contract', () => {
  it('hides a decorative icon from the accessibility tree', () => {
    const html = markup(<Icon name="check" />)
    expect(attr(html, 'aria-hidden')).toBe('true')
    expect(html).not.toContain('role=')
    expect(html).not.toContain('aria-label')
  })

  it('exposes a labelled icon as an image with its name', () => {
    const html = markup(<Icon name="check" label="Done" />)
    expect(attr(html, 'role')).toBe('img')
    expect(attr(html, 'aria-label')).toBe('Done')
    expect(html).not.toContain('aria-hidden')
  })

  it('is never focusable, because a decorative svg must not take a tab stop', () => {
    expect(attr(markup(<Icon name="check" />), 'focusable')).toBe('false')
  })
})

describe('size', () => {
  it('defaults to 1em, so an icon follows the text beside it', () => {
    const html = markup(<Icon name="check" />)
    expect(attr(html, 'width')).toBe('1em')
    expect(attr(html, 'height')).toBe('1em')
  })

  it('maps the five names to their pixel values', () => {
    const expected = { xs: '16', sm: '20', md: '24', lg: '32', xl: '40' } as const
    for (const [name, px] of Object.entries(expected)) {
      const html = markup(<Icon name="check" size={name} />)
      expect(attr(html, 'width'), name).toBe(px)
    }
  })

  it('passes any other CSS length through untouched', () => {
    expect(attr(markup(<Icon name="check" size="2.5rem" />), 'width')).toBe('2.5rem')
    expect(attr(markup(<Icon name="check" size={18} />), 'width')).toBe('18')
  })
})

describe('direction', () => {
  it('mirrors a directional icon in RTL and leaves the rest alone', () => {
    expect(markup(<Icon name="arrow-left" />)).toContain('rtl:-scale-x-100')
    expect(markup(<Icon name="check" />)).not.toContain('rtl:-scale-x-100')
  })

  it('lets flipRtl override the default both ways', () => {
    expect(markup(<Icon name="arrow-left" flipRtl={false} />)).not.toContain('rtl:-scale-x-100')
    expect(markup(<Icon name="check" flipRtl />)).toContain('rtl:-scale-x-100')
  })
})

describe('className', () => {
  it('keeps a consumer utility, proving cn() is used rather than a template string', () => {
    const html = markup(<Icon name="check" className="hidden md:inline-block" />)
    expect(attr(html, 'class')).toContain('hidden')
    expect(attr(html, 'class')).toContain('md:inline-block')
  })

  it('lets the consumer win on a conflict, which is what cn() is for', () => {
    const html = markup(<Icon name="check" className="block" />)
    expect(attr(html, 'class')).toContain('block')
    expect(attr(html, 'class')).not.toMatch(/\binline-block\b/)
  })
})

describe('the aria contract cannot be voided', () => {
  it('treats label="" as decorative, because an img with no name fails axe', () => {
    const html = markup(<Icon name="check" label="" />)
    expect(attr(html, 'aria-hidden')).toBe('true')
    expect(html).not.toContain('role=')
    expect(html).not.toContain('aria-label')
  })

  it('ignores an aria-hidden passed through the spread on a labelled icon', () => {
    const html = markup(<Icon name="check" label="Done" aria-hidden />)
    expect(attr(html, 'role')).toBe('img')
    expect(attr(html, 'aria-label')).toBe('Done')
    expect(html).not.toContain('aria-hidden')
  })

  it('ignores an aria-label passed through the spread on a decorative icon', () => {
    const html = markup(<Icon name="check" aria-label="sneaky" />)
    expect(attr(html, 'aria-hidden')).toBe('true')
    expect(html).not.toContain('sneaky')
  })

  it('still lets the spread through for anything that is not the contract', () => {
    const html = markup(<Icon name="check" data-testid="x" style={{ opacity: 0.5 }} />)
    expect(attr(html, 'data-testid')).toBe('x')
    expect(html).toContain('opacity:0.5')
  })
})

describe('the missing-icon warning', () => {
  it('names an import and a call a developer can paste', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    markup(<Icon name="paper-plane-tilt" />)
    const text = String(warn.mock.calls[0]?.[0] ?? '')
    expect(text).toContain("import { paperPlaneTilt } from 'topclassui/icons/paper-plane-tilt'")
    expect(text).toContain("registerIcons({ 'paper-plane-tilt': paperPlaneTilt })")
  })
})
