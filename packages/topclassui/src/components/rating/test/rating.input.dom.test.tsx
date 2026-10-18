import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Rating, RatingInput } from '../index.js'

const radios = () => screen.getAllByRole<HTMLInputElement>('radio')

describe('max is clamped before the steps are named (R-5.7-7)', () => {
  it('a server Rating and a RatingInput with max={1000} each render ten radios, the last named "10 stars"', () => {
    render(<><Rating readOnly={false} max={1000} aria-label="One" /><RatingInput max={1000} aria-label="Two" /></>)
    expect(radios()).toHaveLength(20)
    expect(radios()[9]?.getAttribute('aria-label')).toBe('10 stars')
    expect(radios()[19]?.getAttribute('aria-label')).toBe('10 stars')
  })
})
