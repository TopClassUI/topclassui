import { describe, expect, it } from 'vitest'

import { findPhysicalDirection } from './css-direction.js'

const lines = (css: string) => findPhysicalDirection(css).map((o) => `${String(o.line)} ${o.property}`)

describe('findPhysicalDirection (R-5.3-2 in CSS)', () => {
  const fails: [string, string][] = [
    ['a translateX on a physical x', '.a { transform: translateX(100%); }'],
    ['a translate() with --tc-dir added', '.a { transform: translate(calc(100% + var(--tc-dir)), 0); }'],
    ['the translate property', '.a { translate: 4px 0; }'],
    ['an origin on a side', '.a { transform-origin: left top; }'],
    ['an origin at a physical percentage', '.a { transform-origin: 25% 50%; }'],
    ['a linear-gradient to a side', '.a { background-image: linear-gradient(to right, red, blue); }'],
    ['a linear-gradient at an inline angle', '.a { background: linear-gradient(90deg, red, blue); }'],
    ['a conic-gradient from an inline angle', '.a { background: conic-gradient(from 90deg, red, blue); }'],
    ['a radial-gradient centred on a side', '.a { background: radial-gradient(at left, red, blue); }'],
    ['an object position on a side outside a [dir] rule', '.a { object-position: left top; }'],
    ['a background position at a physical percentage', '.a { background-position: 25% 0; }'],
    ['a --tc-* token that translates', ':root { --tc-slide: translateX(8px); }'],
  ]
  for (const [label, css] of fails) {
    it(`fails on ${label}`, () => {
      expect(findPhysicalDirection(css), css).toHaveLength(1)
    })
  }

  const passes: [string, string][] = [
    ['a translate times --tc-dir', '.a { transform: translateX(calc(100% * var(--tc-dir))); translate: calc(4px * var(--tc-dir)) 0; }'],
    ['a block-axis translate', '.a { transform: translateY(100%); translate: 0 4px; }'],
    ['the swipe offset Base UI measures', '.a { transform: translate(var(--drawer-swipe-movement-x, 0px), 0); }'],
    ['the measured or centred origin', '.a { transform-origin: var(--transform-origin); } .b { transform-origin: top; }'],
    ['an origin x that follows --tc-dir', '.a { transform-origin: calc(50% - 50% * var(--tc-dir)) 50%; }'],
    ['a vertical gradient', '.a { background: linear-gradient(to bottom, red, blue), linear-gradient(180deg, red, blue); }'],
    ['an angle times --tc-dir', '.a { background: linear-gradient(calc(90deg * var(--tc-dir)), red, blue); }'],
    ['a physical position inside [dir] rules', "[dir='ltr'] .a { object-position: left; } [dir='rtl'] .a { object-position: right; }"],
    ['a centred position', '.a { background-position: center top; object-position: 50% 0; }'],
    ['the direction knob itself', ":root { --tc-dir: 1; } [dir='rtl'] { --tc-dir: -1; }"],
  ]
  for (const [label, css] of passes) {
    it(`allows ${label}`, () => {
      expect(findPhysicalDirection(css), css).toEqual([])
    })
  }

  it('names the line and the property', () => {
    expect(lines('.a {\n  color: red;\n  transform-origin: right;\n}')).toEqual(['3 transform-origin'])
  })
})
