import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { attr, markup } from '#test/markup.js'
import { Slider } from '../index.js'

// The ssr project: what reaches the HTML before any script runs.
const tag = (html: string, name: string) => [...html.matchAll(new RegExp(`<${name} [^>]*>`, 'g'))].map(([found]) => found)
const inputs = (html: string) => tag(html, 'input')
const thumbs = (html: string) => tag(html, 'div').filter((div) => div.includes('data-index='))
const root = (html: string) => tag(html, 'div')[0] ?? ''

const volume = (props: Partial<Parameters<typeof Slider>[0]> = {}) => markup(<Slider aria-label="Volume" name="volume" defaultValue={60} {...props} />)
const price = (props: Partial<Parameters<typeof Slider<readonly [number, number]>>[0]> = {}) => markup(
  <Slider aria-labelledby="price-label" name="price" defaultValue={[20, 80]} {...props} />,
)

describe('one thumb or two', () => {
  it('a number gives one thumb, with its index, placed at its value and not hidden', () => {
    const html = volume()
    expect(thumbs(html)).toHaveLength(1)
    expect(attr(thumbs(html)[0] ?? '', 'data-index')).toBe('0')
    expect(attr(thumbs(html)[0] ?? '', 'style')).toBe('position:absolute;inset-inline-start:60%;top:50%;translate:-50% -50%')
  })

  it('a pair gives two thumbs, each with its index, each placed at its value: neither is hidden before hydration', () => {
    const all = thumbs(price())
    expect(all.map((thumb) => attr(thumb, 'data-index'))).toEqual(['0', '1'])
    expect(all.map((thumb) => attr(thumb, 'style'))).toEqual([
      'position:absolute;inset-inline-start:20%;top:50%;translate:-50% -50%',
      'position:absolute;inset-inline-start:80%;top:50%;translate:-50% -50%',
    ])
  })

  it('each thumb is the target: 24 px, 44 under a coarse pointer, whatever the knob inside it draws', () => {
    for (const thumb of thumbs(price())) {
      expect(attr(thumb, 'class')?.split(' ')).toEqual(expect.arrayContaining([
        'group/thumb', 'min-h-[var(--tc-target-min,24px)]', 'min-w-[var(--tc-target-min,24px)]',
        'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]', 'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]',
      ]))
    }
  })

  it('each thumb holds a range input with the value, the limits and the name; the form sends the name twice for a range', () => {
    expect(inputs(volume()).map((input) => [attr(input, 'type'), attr(input, 'name'), attr(input, 'value')])).toEqual([['range', 'volume', '60']])
    expect(inputs(price()).map((input) => [attr(input, 'name'), attr(input, 'value'), attr(input, 'min'), attr(input, 'max'), attr(input, 'step')]))
      .toEqual([['price', '20', '0', '100', '1'], ['price', '80', '0', '100', '1']])
  })

  it('no default starts at min, below 0 too, where Base UI would otherwise start at 0', () => {
    expect(attr(inputs(markup(<Slider aria-label="V" min={10} max={40} />))[0] ?? '', 'value')).toBe('10')
    expect(attr(inputs(markup(<Slider aria-label="V" min={-50} max={50} />))[0] ?? '', 'value')).toBe('-50')
  })
})

describe('the name (R-5.6-1)', () => {
  it('one thumb: the name and the description go to its range input, and the group has neither', () => {
    const html = markup(<Slider aria-labelledby="v-label" aria-describedby="v-hint" defaultValue={5} />)
    const [input = ''] = inputs(html)
    expect([attr(input, 'aria-labelledby'), attr(input, 'aria-describedby')]).toEqual(['v-label', 'v-hint'])
    expect([attr(root(html), 'aria-labelledby'), attr(root(html), 'aria-describedby')]).toEqual([undefined, undefined])
    expect(attr(inputs(volume())[0] ?? '', 'aria-label')).toBe('Volume')
    expect(attr(root(volume()), 'aria-label')).toBeUndefined()
  })

  it('a range: the group takes the name, each thumb its own, and both thumbs the description', () => {
    const html = price({ 'aria-describedby': 'price-hint' })
    expect(attr(root(html), 'aria-labelledby')).toBe('price-label')
    expect(attr(root(html), 'aria-describedby')).toBeUndefined()
    expect(inputs(html).map((input) => [attr(input, 'aria-label'), attr(input, 'aria-labelledby'), attr(input, 'aria-describedby')]))
      .toEqual([['Minimum', undefined, 'price-hint'], ['Maximum', undefined, 'price-hint']])
  })

  it('a range speaks its plain value, never Base UI\'s English "20 start range"', () => {
    expect(inputs(price()).map((input) => attr(input, 'aria-valuetext'))).toEqual(['20', '80'])
  })

  it('under an Arabic provider the two thumbs are named in Arabic, and the value is written in its digits', () => {
    const html = markup(
      <TopClassProvider direction="rtl" locale="ar" numberingSystem="arab">
        <Slider aria-label="السعر" defaultValue={[20, 80]} showValue />
      </TopClassProvider>,
    )
    expect(inputs(html).map((input) => [attr(input, 'aria-label'), attr(input, 'aria-valuetext')]))
      .toEqual([['الحد الأدنى', '٢٠'], ['الحد الأقصى', '٨٠']])
    expect(html).toContain('>٢٠ – ٨٠</output>')
    // RTL keys and a mirrored thumb: Base UI translates the centre toward the inline start.
    expect(attr(thumbs(html)[0] ?? '', 'style')).toBe('position:absolute;inset-inline-start:20%;top:50%;translate:50% -50%')
  })

  it('the provider\'s locale formats the value, never the runtime\'s', () => {
    const html = markup(
      <TopClassProvider direction="ltr" locale="de">
        <Slider aria-label="Price" defaultValue={1500} max={2000} showValue />
      </TopClassProvider>,
    )
    expect(html).toContain('>1.500</output>')
  })

  it('a caller locale wins over the provider\'s, and a caller numberingSystem over its digits', () => {
    const german = markup(<Slider aria-label="Price" defaultValue={1500} max={2000} locale="de" showValue />)
    expect(german).toContain('>1.500</output>')
    const latin = markup(
      <TopClassProvider direction="rtl" locale="ar" numberingSystem="arab">
        <Slider aria-label="Price" defaultValue={60} format={{ numberingSystem: 'latn' }} showValue />
      </TopClassProvider>,
    )
    expect(latin).toContain('>60</output>')
  })

  it('an id the caller passes reaches the group, not the input', () => {
    const html = volume({ id: 'vol' })
    expect(attr(root(html), 'id')).toBe('vol')
    expect(attr(inputs(html)[0] ?? '', 'id')).not.toBe('vol')
  })
})

describe('limits, clamped (R-5.7-7)', () => {
  it('step={0} becomes the bound, 0.000001, and a negative step too', () => {
    expect(attr(inputs(volume({ step: 0 }))[0] ?? '', 'step')).toBe('0.000001')
    expect(attr(inputs(volume({ step: -5 }))[0] ?? '', 'step')).toBe('0.000001')
  })

  it('min and max past a quadrillion stop there', () => {
    const [input = ''] = inputs(volume({ min: -1e308, max: 1e308 }))
    expect([attr(input, 'min'), attr(input, 'max')]).toEqual(['-1000000000000000', '1000000000000000'])
  })

  it('a value outside the limits is shown at the limit, as Base UI clamps it', () => {
    expect(attr(inputs(volume({ defaultValue: 500 }))[0] ?? '', 'value')).toBe('100')
  })
})

describe('what reaches the root', () => {
  it('a div with role group, its size, and the classes of the box that owns the width', () => {
    const html = volume()
    expect(root(html)).toMatch(/^<div data-orientation="horizontal" id="[^"]+" role="group" dir="ltr" data-size="md" class="/)
    expect(attr(root(html), 'class')?.split(' ')).toEqual(expect.arrayContaining(['group/slider', 'grid', 'w-fit', 'grid-cols-[minmax(0,var(--tc-input-width))]', 'text-sm']))
  })

  it('the root carries the direction Base UI runs its keys and pointer in, so the thumb is drawn the same way', () => {
    expect(attr(root(volume()), 'dir')).toBe('ltr')
    const group = tag(markup(<TopClassProvider direction="rtl" locale="ar"><Slider aria-label="Volume" /></TopClassProvider>), 'div').filter((div) => div.includes('role="group"'))
    expect(group.map((div) => attr(div, 'dir'))).toEqual(['rtl'])
    expect(attr(root(volume({ dir: 'rtl' })), 'dir')).toBe('ltr')
  })

  it('in the server HTML invalid sets aria-invalid on the group only, the range inputs take it at hydration; off, a caller aria-invalid survives', () => {
    expect(attr(root(volume({ invalid: true })), 'aria-invalid')).toBe('true')
    expect(inputs(volume({ invalid: true })).filter((input) => input.includes('aria-invalid'))).toEqual([])
    expect(attr(root(volume()), 'aria-invalid')).toBeUndefined()
    expect(attr(root(volume({ 'aria-invalid': true })), 'aria-invalid')).toBe('true')
  })

  it('the control takes the padding of its size over half a target; custom keeps half a target', () => {
    const padding = (html: string) => attr(tag(html, 'div').find((div) => div.includes('data-base-ui-swipe-ignore')) ?? '', 'class')?.split(' ').filter((cls) => /^(pointer-coarse:)?px-/.test(cls))
    expect(padding(volume({ size: 'xl' }))).toEqual([
      'px-[max(calc(var(--tc-target-min,24px)/2),calc(var(--spacing-knob-xl)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]',
      'pointer-coarse:px-[max(calc(var(--tc-target-coarse,44px)/2),calc(var(--spacing-knob-xl)/2+var(--tc-ring-offset)+var(--tc-ring-width)))]',
    ])
    expect(padding(volume({ size: 'custom' }))).toEqual(['px-[calc(var(--tc-target-min,24px)/2)]', 'pointer-coarse:px-[calc(var(--tc-target-coarse,44px)/2)]'])
  })

  it('the control carries Base UI\'s swipe marker, so a thumb dragged inside a Drawer never swipes it shut', () => {
    const control = tag(volume(), 'div').filter((div) => div.includes('data-base-ui-swipe-ignore'))
    expect(control.map((div) => attr(div, 'class')?.split(' ')[0])).toEqual(['relative'])
  })

  it('required is accepted and lands on no element: Base UI has none', () => {
    expect(volume({ required: true })).not.toContain('required')
  })

  it('the thumb is always centred: no edge alignment and no inline script', () => {
    expect(volume()).not.toContain('<script')
    expect(price()).not.toContain('visibility:hidden')
  })

  it('size: the type step of an Input, the track and the knob; custom emits none of them', () => {
    expect(attr(root(volume({ size: 'xl' })), 'data-size')).toBe('xl')
    expect(volume({ size: 'xl' })).toContain('size-knob-xl')
    expect(volume({ size: 'xl' })).toMatch(/<div data-orientation="horizontal" style="position:relative" class="w-full [^"]* h-2">/)
    expect(attr(root(volume({ size: 'xs' })), 'class')).toContain(' text-xs ')
    expect(attr(root(volume({ size: 'lg' })), 'class')?.endsWith(' text-base pointer-coarse:text-[max(1rem,16px)]')).toBe(true)
    const custom = volume({ size: 'custom' })
    expect(custom).not.toMatch(/size-knob-|text-(xs|sm|base)|h-1\b|h-1\.5|h-2\b/)
  })

  it('fullWidth puts w-full and one full column after the width of an Input', () => {
    const classes = attr(root(volume({ fullWidth: true })), 'class')?.split(' ') ?? []
    expect(classes).toEqual(expect.arrayContaining(['w-full', 'grid-cols-1']))
    expect(classes).not.toContain('w-fit')
  })

  it('showValue writes an output after the control, inside the row; without it there is none', () => {
    expect(volume({ showValue: true })).toMatch(/<\/div><\/div><output [^>]*class="ms-auto min-w-\[3ch\][^"]*">60<\/output><\/div><\/div>$/)
    expect(volume()).not.toContain('<output')
  })

  it('disabled reaches every range input, so the form sends nothing', () => {
    const html = price({ disabled: true })
    expect(root(html)).toContain('data-disabled=""')
    expect(inputs(html).every((input) => input.includes('disabled=""'))).toBe(true)
  })

  it('form names the form every range input belongs to', () => {
    expect(inputs(price({ form: 'settings' })).every((input) => input.includes('form="settings"'))).toBe(true)
  })

  it('the rest props, style and the caller className reach the group', () => {
    const html = volume({ title: 'Volume', style: { marginBlock: 4 }, className: 'ms-2' })
    expect(root(html)).toContain('title="Volume"')
    expect(root(html)).toContain('style="margin-block:4px"')
    expect(attr(root(html), 'class')?.endsWith(' ms-2')).toBe(true)
  })
})
