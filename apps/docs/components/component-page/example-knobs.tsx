'use client'

// The page controls of page 14: density and radius, written as --tc-* knobs on the examples only.
import { useState } from 'react'
import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'

import { KNOB, KNOBS } from '../classes'
import { DENSITY, KNOB_DEFAULTS, RADIUS } from './knob-values'

export interface ExampleKnobsProps {
  labels: {
    density: string
    radius: string
    values: Record<keyof typeof DENSITY | keyof typeof RADIUS, string>
  }
  /** The id of the examples' box, which the server renders with the defaults; each example hydrates on its own, so the knobs do not wrap them. */
  target: string
}

export function ExampleKnobs({ labels, target }: ExampleKnobsProps) {
  const [density, setDensity] = useState<keyof typeof DENSITY>(KNOB_DEFAULTS.density)
  const [radius, setRadius] = useState<keyof typeof RADIUS>(KNOB_DEFAULTS.radius)
  const write = (name: string, value: string) => { document.getElementById(target)?.style.setProperty(name, value) }
  return (
    <div className={KNOBS}>
      <Knob name={labels.density} value={density} options={DENSITY} labels={labels.values} onChange={(key) => { setDensity(key); write('--tc-density', DENSITY[key]) }} />
      <Knob name={labels.radius} value={radius} options={RADIUS} labels={labels.values} onChange={(key) => { setRadius(key); write('--tc-radius', RADIUS[key]) }} />
    </div>
  )
}

interface KnobProps<K extends string> {
  name: string
  value: K
  options: Record<K, string>
  labels: Record<string, string>
  onChange: (value: K) => void
}

function Knob<K extends string>({ name, value, options, labels, onChange }: KnobProps<K>) {
  const keys = Object.keys(options) as K[]
  return (
    <div className={KNOB}>
      <span aria-hidden="true">{name}</span>
      <SegmentedControlRoot
        aria-label={name}
        size="sm"
        value={value}
        onValueChange={(next) => {
          const key = keys.find((item) => item === next)
          if (key !== undefined) onChange(key)
        }}
      >
        {keys.map((key) => <SegmentedControlItem key={key} value={key}>{labels[key] ?? key}</SegmentedControlItem>)}
      </SegmentedControlRoot>
    </div>
  )
}
