'use client'

// One Try it control (S7, S8): a library control per kind, labelled by the prop name and described by its description.
import { NumberField } from 'topclassui/number-field'
import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'
import { Select } from 'topclassui/select'
import { Slider } from 'topclassui/slider'
import { Switch } from 'topclassui/switch'

import type { Control } from '../../lib/components'
import type { PropValue } from '../../lib/usage'
import { CONTROL, CONTROL_LABEL } from '../classes'

export interface TryItControlProps {
  control: Control
  value: PropValue | undefined
  onChange: (value: PropValue) => void
  /** The prop's description, read after its name. */
  description: string
  idBase: string
}

/** A segmented or select value comes back as text; this finds the option it stands for. */
const optionOf = (options: readonly PropValue[], text: string | null) => options.find((option) => String(option) === text)

export function TryItControl({ control, value, onChange, description, idBase }: TryItControlProps) {
  const labelId = `${idBase}-${control.prop}`
  const describedBy = `${labelId}-description`
  const named = { 'aria-labelledby': labelId, 'aria-describedby': describedBy }
  return (
    <div className={CONTROL}>
      <span id={labelId} dir="ltr" className={CONTROL_LABEL}>{control.prop}</span>
      <span id={describedBy} className="sr-only">{description}</span>
      {control.kind === 'segmented' ? (
        <SegmentedControlRoot
          {...named}
          size="sm"
          fullWidth
          value={String(value ?? control.options[0])}
          onValueChange={(next) => {
            const option = optionOf(control.options, next)
            if (option !== undefined) onChange(option)
          }}
        >
          {control.options.map((option) => (
            <SegmentedControlItem key={String(option)} value={String(option)}>{String(option)}</SegmentedControlItem>
          ))}
        </SegmentedControlRoot>
      ) : null}
      {control.kind === 'select' ? (
        <Select
          {...named}
          size="sm"
          fullWidth
          items={control.options.map((option) => ({ value: String(option), label: String(option) }))}
          value={value === undefined ? null : String(value)}
          onValueChange={(next) => {
            const option = optionOf(control.options, next)
            if (option !== undefined) onChange(option)
          }}
        />
      ) : null}
      {control.kind === 'switch' ? (
        <Switch {...named} size="sm" checked={value === true} onCheckedChange={(checked) => { onChange(checked) }} />
      ) : null}
      {control.kind === 'slider' ? (
        <Slider
          {...named}
          size="sm"
          fullWidth
          showValue
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={typeof value === 'number' ? value : control.min}
          onValueChange={(next) => { if (typeof next === 'number') onChange(next) }}
        />
      ) : null}
      {control.kind === 'number' ? (
        <NumberField
          {...named}
          size="sm"
          fullWidth
          min={control.min ?? undefined}
          max={control.max ?? undefined}
          step={control.step ?? 1}
          value={typeof value === 'number' ? value : null}
          onValueChange={(next) => { if (next !== null) onChange(next) }}
        />
      ) : null}
    </div>
  )
}
