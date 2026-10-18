'use client'

import { useEffect, useState } from 'react'

export const RADIUS = { min: 0, max: 1.5, step: 0.125, initial: 0.5 } as const
export const DENSITY = { min: 0.75, max: 1.25, step: 0.05, initial: 1 } as const

/** The radius and density sliders: each writes its knob on this page's main, and leaving the page drops both. */
export function usePageKnobs() {
  const [radius, setRadius] = useState<number>(RADIUS.initial)
  const [density, setDensity] = useState<number>(DENSITY.initial)

  useEffect(() => {
    const main = document.getElementById('main')
    main?.style.setProperty('--tc-radius', `${String(radius)}rem`)
    main?.style.setProperty('--tc-density', String(density))
  }, [radius, density])

  useEffect(() => () => {
    const main = document.getElementById('main')
    main?.style.removeProperty('--tc-radius')
    main?.style.removeProperty('--tc-density')
  }, [])

  const numberOf = (value: number | readonly number[]) => (typeof value === 'number' ? value : (value[0] ?? 0))
  return {
    radius,
    density,
    setRadius: (value: number | readonly number[]) => { setRadius(numberOf(value)) },
    setDensity: (value: number | readonly number[]) => { setDensity(numberOf(value)) },
  }
}
