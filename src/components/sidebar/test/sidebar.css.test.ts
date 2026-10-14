import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import * as classes from '../classes.js'

const RING_REACH = 'calc(var(--tc-ring-width) + var(--tc-ring-offset))'
const CLOSED = ':is(:where(.group\\/sidebar)[data-closed] *) {'

/** What each class Sidebar writes must emit, written out: a class Tailwind does not know emits nothing at all. */
const DECLARATION: Record<string, string> = {
  // The rail.
  'flex': 'display: flex;',
  'h-full': 'height: 100%;',
  'shrink-0': 'flex-shrink: 0;',
  'flex-col': 'flex-direction: column;',
  'gap-1': 'gap: var(--spacing);',
  'bg-surface': 'background-color: var(--tc-surface);',
  'p-2.5': 'padding: calc(var(--spacing) * 2.5);',
  'text-body': 'color: var(--tc-body);',
  'border-e-(length:--tc-line-width)': 'border-inline-end-width: var(--tc-line-width);',
  'border-line': 'border-color: var(--tc-line);',
  'data-open:w-55': 'width: calc(var(--spacing) * 55);',
  'data-closed:w-15': 'width: calc(var(--spacing) * 15);',
  'pointer-coarse:data-closed:min-w-[calc(var(--tc-target-coarse,44px)+1.25rem+var(--tc-line-width))]':
    'min-width: calc(var(--tc-target-coarse,44px) + 1.25rem + var(--tc-line-width));',
  'max-w-full': 'max-width: 100%;',
  // The toggle.
  'inline-flex': 'display: inline-flex;',
  'items-center': 'align-items: center;',
  'justify-center': 'justify-content: center;',
  'rounded-control': 'border-radius: var(--tc-radius);',
  'min-h-[var(--tc-target-min,24px)]': 'min-height: var(--tc-target-min,24px);',
  'min-w-[var(--tc-target-min,24px)]': 'min-width: var(--tc-target-min,24px);',
  'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]': 'min-height: var(--tc-target-coarse,44px);',
  'pointer-coarse:min-w-[var(--tc-target-coarse,44px)]': 'min-width: var(--tc-target-coarse,44px);',
  'outline-none': 'outline-style: none;',
  'focus-visible:outline-solid': 'outline-style: solid;',
  'focus-visible:outline-(length:--tc-ring-width)': 'outline-width: var(--tc-ring-width);',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': 'outline-offset: var(--tc-ring-offset);',
  'focus-visible:outline-ring': 'outline-color: var(--tc-ring);',
  'transition-[color,background-color,border-color,outline-color,opacity,translate]':
    'transition-property: color,background-color,border-color,outline-color,opacity,translate;',
  'duration-(--tc-duration)': 'transition-duration: var(--tc-duration);',
  'ease-out': 'transition-timing-function: var(--ease-out);',
  'text-muted': 'color: var(--tc-muted);',
  'tone-neutral': '--tc-soft: var(--tc-neutral-soft);',
  'hover:bg-(--tc-soft)': 'background-color: var(--tc-soft);',
  'active:bg-(--tc-soft-hover)': 'background-color: var(--tc-soft-hover);',
  // The header and its title.
  'gap-2': 'gap: calc(var(--spacing) * 2);',
  'pb-1.5': 'padding-bottom: calc(var(--spacing) * 1.5);',
  'group-data-closed/sidebar:justify-center': 'justify-content: center;',
  'truncate': 'text-overflow: ellipsis;',
  'min-w-0': 'min-width: 0px;',
  'text-sm': 'font-size: var(--text-sm);',
  'font-semibold': 'font-weight: var(--font-weight-semibold);',
  'group-data-closed/sidebar:sr-only': 'clip-path: inset(50%);',
  // The body.
  'relative': 'position: relative;',
  'flex-1': 'flex: 1;',
  'overflow-y-auto': 'overflow-y: auto;',
  'overscroll-contain': 'overscroll-behavior: contain;',
  'scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]': `scroll-padding-block: ${RING_REACH};`,
  '-m-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]': `margin: calc(${RING_REACH} * -1);`,
  'p-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]': `padding: ${RING_REACH};`,
  'group-data-closed/sidebar:[scrollbar-width:none]': 'scrollbar-width: none;',
  // The label of a group.
  'px-3': 'padding-inline: calc(var(--spacing) * 3);',
  'py-1': 'padding-block: var(--spacing);',
  'text-xs': 'font-size: var(--text-xs);',
  'font-medium': 'font-weight: var(--font-weight-medium);',
  // A row, and the current one.
  'overflow-hidden': 'overflow: hidden;',
  'min-h-(--tc-row-height)': 'min-height: var(--tc-row-height);',
  'w-full': 'width: 100%;',
  'text-start': 'text-align: start;',
  'bg-primary-soft': 'background-color: var(--tc-primary-soft);',
  'text-primary-on-soft': 'color: var(--tc-primary-on-soft);',
  'before:absolute': 'position: absolute;',
  'before:inset-y-2': 'inset-block: calc(var(--spacing) * 2);',
  'before:inset-s-1': 'inset-inline-start: var(--spacing);',
  'before:w-0.75': 'width: calc(var(--spacing) * 0.75);',
  'before:rounded-full': 'border-radius: calc(infinity * 1px);',
  'before:bg-current': 'background-color: currentcolor;',
  'forced-colors:forced-color-adjust-none': 'forced-color-adjust: none;',
  'forced-colors:bg-[Highlight]': 'background-color: Highlight;',
  'forced-colors:text-[HighlightText]': 'color: HighlightText;',
  'forced-colors:[--tc-ring:CanvasText]': '--tc-ring: CanvasText;',
}

/** The attribute, the state or the pseudo-element each variant class must be scoped to, or it would paint everywhere. */
const SCOPE: Record<string, string> = {
  'data-open:w-55': '[data-open] {',
  'data-closed:w-15': '[data-closed] {',
  'pointer-coarse:data-closed:min-w-[calc(var(--tc-target-coarse,44px)+1.25rem+var(--tc-line-width))]': '[data-closed] {',
  'group-data-closed/sidebar:justify-center': CLOSED,
  'group-data-closed/sidebar:sr-only': CLOSED,
  'group-data-closed/sidebar:[scrollbar-width:none]': CLOSED,
  'focus-visible:outline-solid': ':focus-visible {',
  'focus-visible:outline-(length:--tc-ring-width)': ':focus-visible {',
  'focus-visible:outline-offset-(length:--tc-ring-offset)': ':focus-visible {',
  'focus-visible:outline-ring': ':focus-visible {',
  'hover:bg-(--tc-soft)': ':hover {',
  'active:bg-(--tc-soft-hover)': ':active {',
  'before:absolute': '::before {',
  'before:inset-y-2': '::before {',
  'before:inset-s-1': '::before {',
  'before:w-0.75': '::before {',
  'before:rounded-full': '::before {',
  'before:bg-current': '::before {',
}

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The rule Tailwind emits for one class: from its selector, whole and not the start of a longer one, to the first closing brace. */
function ruleFor(css: string, cls: string): string {
  const selector = `.${escape(cls)}`
  for (let from = css.indexOf(selector); from !== -1; from = css.indexOf(selector, from + 1)) {
    if (!/[\w\\-]/.test(css[from + selector.length] ?? '')) return css.slice(from, css.indexOf('}', from) + 1)
  }
  return ''
}

const written = [...new Set(
  Object.values(classes).flatMap((value) => (typeof value === 'string' ? [value] : Object.values(value))).join(' ').split(' '),
)].filter(Boolean).sort()

describe('every class Sidebar writes compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(written))

  it('the table names exactly the classes of classes.ts, and the one that only marks the group', () => {
    expect(written).toEqual([...Object.keys(DECLARATION), 'group/sidebar'].sort())
    expect(written).toHaveLength(71)
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }

  for (const [cls, scope] of Object.entries(SCOPE)) {
    it(`${cls} applies only under ${scope.slice(0, -2)}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(scope)
    })
  }

  it('group/sidebar has no rule of its own: it only names the element the parts below read', async () => {
    const sheet = await css
    expect(sheet).not.toContain('.group\\/sidebar {')
    expect(sheet).not.toContain('.group\\/sidebar,')
    expect(sheet).toContain(':where(.group\\/sidebar)[data-closed] *)')
  })

  it('a collapsed label is hidden the way sr-only hides: one clipped pixel that keeps its text for a screen reader', async () => {
    const rule = ruleFor(await css, 'group-data-closed/sidebar:sr-only')
    for (const declaration of ['position: absolute;', 'width: 1px;', 'height: 1px;', 'padding: 0;', 'margin: -1px;', 'overflow: hidden;', 'white-space: nowrap;']) {
      expect(rule, declaration).toContain(declaration)
    }
    expect(rule).not.toContain('display: none')
    expect(rule).not.toContain('visibility')
  })

  it('the rule scan reads nothing for a class that has no rule, and never the rule of a longer class', async () => {
    expect(ruleFor(await css, 'no-such-class-here')).toBe('')
    expect(ruleFor('.flex-col { flex-direction: column; } .flex { display: flex; }', 'flex')).toBe('.flex { display: flex; }')
  })
})
