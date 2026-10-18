import { describe, expect, it } from 'vitest'

import { absolute, floorOf, INSTALL_LINE, PEERS } from './site.js'

describe('floorOf', () => {
  it('reads the floor of a caret range', () => {
    expect(floorOf('^19.0.0')).toBe('19+')
    expect(floorOf('^4.2.0')).toBe('4.2+')
    expect(floorOf('>=20.9')).toBe('20.9+')
  })
})

describe('the package facts', () => {
  it('prints the peers the package declares', () => {
    expect(PEERS).toEqual({ react: '19+', tailwindcss: '4.2+' })
  })

  it('installs zod beside the package', () => {
    expect(INSTALL_LINE).toMatch(/^npm i topclassui(@beta)? zod$/)
  })

  it('builds absolute URLs from the one origin', () => {
    expect(absolute('/en/docs/css')).toBe('https://topclassui.com/en/docs/css')
  })
})
