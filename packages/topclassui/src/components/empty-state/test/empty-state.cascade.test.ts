/** Two utilities of the root write border-style, so the emitted order could decide the dash.
 * A class-list assertion cannot see that, so the stylesheet is read here. */
import { beforeAll, describe, expect, it } from 'vitest'

import { compileEntry, declarationIndex } from '#test/stylesheet.js'

let css = ''

beforeAll(async () => {
  css = (await compileEntry()).build(['border-dashed', 'border-(length:--tc-line-width)', 'wrap-anywhere'])
})

const at = (selector: string, property: string) => declarationIndex(css, selector, property)

describe('the frame is dashed in the browser, not only in the class list', () => {
  it('emits border-dashed as a real style and as the variable the width utility reads', () => {
    // The leading space keeps the match off --tw-border-style, which ends in the same text.
    expect(at('.border-dashed', ' border-style: dashed')).toBeGreaterThan(-1)
    expect(at('.border-dashed', '--tw-border-style: dashed')).toBeGreaterThan(-1)
  })

  it('has the width utility read that variable, so either order keeps the dash', () => {
    expect(at('.border-\\(length\\:--tc-line-width\\)', 'border-style: var(--tw-border-style)'))
      .toBeGreaterThan(-1)
  })

  it('puts border-dashed after the width utility, so it wins even without the variable', () => {
    const width = at('.border-\\(length\\:--tc-line-width\\)', ' border-style:')
    const dash = at('.border-dashed', ' border-style:')
    expect(width, 'the width utility is not emitted').toBeGreaterThan(-1)
    expect(dash).toBeGreaterThan(width)
  })

  it('compiles wrap-anywhere, so a long URL breaks inside the frame', () => {
    expect(at('.wrap-anywhere', 'overflow-wrap: anywhere')).toBeGreaterThan(-1)
  })
})
