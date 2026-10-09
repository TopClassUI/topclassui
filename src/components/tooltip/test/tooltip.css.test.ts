import { describe, expect, it } from 'vitest'

import { compileEntry } from '#test/stylesheet.js'
import { TOOLTIP_ARROW, TOOLTIP_POPUP, TOOLTIP_POSITIONER } from '../classes.js'

// The static harness never opens a popup, so these classes never reach Tailwind there.
const DECLARATION: Record<string, string> = {
  'max-w-xs': 'max-width: var(--container-xs);',
  'wrap-anywhere': 'overflow-wrap: anywhere;',
  'rounded-control': 'border-radius: var(--tc-radius);',
  'bg-neutral-solid': 'background-color: var(--tc-neutral-solid);',
  'px-3': 'padding-inline: calc(var(--spacing) * 3);',
  'py-1': 'padding-block: var(--spacing);',
  'text-xs': 'font-size: var(--text-xs);',
  'text-neutral-on-solid': 'color: var(--tc-neutral-on-solid);',
  'z-(--tc-z-popup)': 'z-index: var(--tc-z-popup);',
  'data-anchor-hidden:invisible': 'visibility: hidden;',
  'size-2': 'width: calc(var(--spacing) * 2);',
  'rotate-45': 'rotate: 45deg;',
  'data-[side=top]:-bottom-1': 'bottom: calc(var(--spacing) * -1);',
  'data-[side=bottom]:-top-1': 'top: calc(var(--spacing) * -1);',
  'data-[side=inline-start]:-inset-e-1': 'inset-inline-end: calc(var(--spacing) * -1);',
  'data-[side=inline-end]:-inset-s-1': 'inset-inline-start: calc(var(--spacing) * -1);',
}

/** The attribute each variant class must be scoped to, or it would paint on every side. */
const SCOPE: Record<string, string> = {
  'data-anchor-hidden:invisible': '[data-anchor-hidden]',
  'data-[side=top]:-bottom-1': '[data-side="top"]',
  'data-[side=bottom]:-top-1': '[data-side="bottom"]',
  'data-[side=inline-start]:-inset-e-1': '[data-side="inline-start"]',
  'data-[side=inline-end]:-inset-s-1': '[data-side="inline-end"]',
}

const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, '\\$&')

/** The rule Tailwind emits for one class: its selector up to the closing brace. */
function ruleFor(css: string, cls: string): string {
  const at = css.indexOf(`.${escape(cls)}`)
  return at === -1 ? '' : css.slice(at, css.indexOf('}', at) + 1)
}

describe('every class Tooltip writes compiles with the installed Tailwind', () => {
  const css = compileEntry().then((compiled) => compiled.build(Object.keys(DECLARATION)))

  it('the table names exactly the classes of the popup, the positioner and the arrow', () => {
    // The arrow repeats the popup fill, so each class is counted once.
    const written = new Set([TOOLTIP_POPUP, TOOLTIP_POSITIONER, TOOLTIP_ARROW].join(' ').split(' '))
    expect([...written].sort()).toEqual(Object.keys(DECLARATION).sort())
  })

  for (const [cls, declaration] of Object.entries(DECLARATION)) {
    it(`${cls} emits ${declaration}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(declaration)
    })
  }

  for (const [cls, scope] of Object.entries(SCOPE)) {
    it(`${cls} applies only under ${scope}`, async () => {
      expect(ruleFor(await css, cls), cls).toContain(`${scope} {`)
    })
  }
})
