'use client'

import { BORDER } from 'topclassui/classes'
import { Slider } from 'topclassui/slider'

import type { GuideLabels } from '../../labels/guides'
import { DENSITY, RADIUS, usePageKnobs } from './use-page-knobs'

interface KnobProps {
  id: string
  label: string
  value: number
  range: { min: number; max: number; step: number }
  onValueChange: (value: number | readonly number[]) => void
}

function Knob({ id, label, value, range, onValueChange }: KnobProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center justify-between gap-2 text-sm text-body">
        <span id={id}>{label}</span>
        <output dir="ltr" className="font-mono text-muted">{value}</output>
      </span>
      <Slider aria-labelledby={id} min={range.min} max={range.max} step={range.step} value={value} onValueChange={onValueChange} />
    </div>
  )
}

/** Live knobs at the top of Colors (PLAN 6.4): the page's mode is the top bar's switch; radius and density are here. */
export function PageControls({ labels }: { labels: GuideLabels['controls'] }) {
  const knobs = usePageKnobs()
  return (
    <section aria-label={labels.label} className={`flex flex-col gap-3 rounded-box bg-surface p-4 ${BORDER}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Knob id="page-knob-radius" label={labels.radius} value={knobs.radius} range={RADIUS} onValueChange={knobs.setRadius} />
        <Knob id="page-knob-density" label={labels.density} value={knobs.density} range={DENSITY} onValueChange={knobs.setDensity} />
      </div>
      <p className="text-sm text-muted">{labels.note}</p>
    </section>
  )
}
