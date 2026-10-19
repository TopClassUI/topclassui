/** A class list cannot show that a bracketed value compiles or that reduced motion wins
 * the cascade, so this compiles the real entry and reads what the browser would get. */
import { createElement } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'

import { markup } from '#test/markup.js'
import { compileEntry, declarationIndex } from '#test/stylesheet.js'
import { Skeleton } from '../index.js'

const HTML = [
  markup(createElement(Skeleton, { rows: 3 })),
  markup(createElement(Skeleton, { variant: 'circle' })),
  markup(createElement(Skeleton, { variant: 'rect' })),
  markup(createElement(Skeleton, { variant: 'card' })),
].join('')

/** What the component really renders, every shape and both kinds of row, so a renamed
 * class is compiled as renamed rather than as this file remembers it. */
const RENDERED = [...new Set([...HTML.matchAll(/class="([^"]*)"/g)].flatMap((m) => (m[1] ?? '').split(' ')))]

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(RENDERED)
})

/** Tailwind's selector for a class: every character outside a plain name is escaped. */
const selectorOf = (cls: string) => `.${cls.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`

/** The declarations of the first rule for a selector, without the braces. */
const ruleOf = (selector: string) => {
  const at = css.indexOf(`${selector} {`)
  return at === -1 ? '' : css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim()
}

describe('every class the component renders paints something', () => {
  it('rendered the classes at all, so an empty list cannot pass', () => {
    expect(RENDERED.length).toBeGreaterThan(15)
  })

  it('finds a rule for each one, so a typo or an unknown token cannot ship silently', () => {
    expect(RENDERED.filter((cls) => !css.includes(`${selectorOf(cls)} {`))).toEqual([])
  })
})

describe('a row is exactly one line of the text it replaces', () => {
  it('is three quarters of the font size, as Figma draws the bar', () => {
    expect(ruleOf('.h-\\[0\\.75em\\]')).toBe('height: 0.75em;')
  })

  it('splits the rest of the line height between its two margins', () => {
    expect(ruleOf('.my-\\[calc\\(\\(1lh-0\\.75em\\)\\/2\\)\\]')).toBe('margin-block: calc((1lh - 0.75em) / 2);')
  })

  it('narrows the row before it to five sixths', () => {
    expect(ruleOf('.w-5\\/6')).toBe('width: calc(5 / 6 * 100%);')
  })

  it('narrows the last row to two thirds of the column', () => {
    expect(ruleOf('.w-2\\/3')).toBe('width: calc(2 / 3 * 100%);')
  })
})

describe('the shapes compile to what the spec draws', () => {
  it('makes the circle as wide and as tall as a md control', () => {
    const height = /height: ([^;]+);/.exec(ruleOf('.h-control-md'))?.[1] ?? 'missing'
    const circle = ruleOf('.size-control-md')
    expect(circle).toContain(`width: ${height};`)
    expect(circle).toContain(`height: ${height};`)
  })

  it('rounds the circle fully', () => {
    expect(ruleOf('.rounded-full')).toBe('border-radius: calc(infinity * 1px);')
  })

  it('gives the card the 200 x 80 ratio of the Components page', () => {
    expect(ruleOf('.aspect-5\\/2')).toBe('aspect-ratio: 5/2;')
  })
})

describe('reduced motion stops the pulse', () => {
  it('ships the pulse keyframes, or animate-pulse would name nothing', () => {
    expect(css).toContain('@keyframes pulse')
  })

  it('puts animate-none after animate-pulse, so the reader who asked for stillness gets it', () => {
    const pulse = declarationIndex(css, '.animate-pulse', 'animation')
    const still = declarationIndex(css, '.motion-reduce\\:animate-none', 'animation')
    expect(pulse, 'animate-pulse is not emitted').toBeGreaterThan(-1)
    expect(still, 'motion-reduce:animate-none is not emitted after the pulse').toBeGreaterThan(pulse)
  })

  it('scopes animate-none to the reduced-motion query, so everyone else still sees the pulse', () => {
    const still = css.indexOf('.motion-reduce\\:animate-none')
    const query = css.lastIndexOf('@media (prefers-reduced-motion: reduce)', still)
    expect(query).toBeGreaterThan(-1)
    expect(still).toBeGreaterThan(query)
    expect(css.slice(query, still)).not.toContain('}')
  })
})

describe('the line that forced colours leave of a fill', () => {
  const edge = selectorOf('forced-colors:outline-(length:--tc-line-width)')

  it('is an outline at the line width, which takes no room in the layout', () => {
    expect(ruleOf(edge)).toContain('outline-style: var(--tw-outline-style);')
    expect(ruleOf(edge)).toContain('outline-width: var(--tc-line-width);')
    // Nothing on a skeleton resets the style, so it is the registered initial value.
    expect(css).toMatch(/@property --tw-outline-style \{[^}]*initial-value: solid;/)
  })

  it('sits inside the forced-colours query, so no other mode gains an outline', () => {
    const query = css.indexOf('@media (forced-colors: active)')
    expect(query).toBeGreaterThan(-1)
    expect(css.indexOf(`${edge} {`)).toBeGreaterThan(query)
    expect(css.split(`${edge} {`)).toHaveLength(2)
  })
})
