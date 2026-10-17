'use client'

// The page controls of page 14: density and radius, written as --tc-* knobs on the examples only.
import { type ReactNode, useState } from 'react'
import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'

import { KNOB, KNOBS } from '../classes'

/** Three steps each; the middle one is the token's own default (tokens.css). */
export const DENSITY = { compact: '0.875', normal: '1', comfortable: '1.25' } as const
export const RADIUS = { square: '0rem', rounded: '0.5rem', pill: '9999px' } as const

export interface ExampleKnobsProps {
  labels: {
    density: string
    radius: string
    values: Record<keyof typeof DENSITY | keyof typeof RADIUS, string>
  }
  children: ReactNode
}

export function ExampleKnobs({ labels, children }: ExampleKnobsProps) {
  const [density, setDensity] = useState<keyof typeof DENSITY>('normal')
  const [radius, setRadius] = useState<keyof typeof RADIUS>('rounded')
  return (
    <>
      <div className={KNOBS}>
        <Knob name={labels.density} value={density} options={DENSITY} labels={labels.values} onChange={setDensity} />
        <Knob name={labels.radius} value={radius} options={RADIUS} labels={labels.values} onChange={setRadius} />
      </div>
      <div style={{ '--tc-density': DENSITY[density], '--tc-radius': RADIUS[radius] }} className="grid min-w-0 gap-4">
        {children}
      </div>
    </>
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
