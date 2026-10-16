import type { Slider as Base } from '@base-ui/react/slider'
import type { Ref } from 'react'

import type { GroupName } from '#shared/contracts/name.js'
import type { SliderSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type SliderDesignProps = {
  [K in keyof SliderSchemaInput]?: SliderSchemaInput[K] | undefined
}

/** R-5.6-1: the range input a name must reach sits inside the thumb, where no `<label htmlFor>` and no `id` reach. */
export type SliderName = GroupName

/** A number gives one thumb, a pair gives a range of two. */
export type SliderValue = number | readonly [number, number]

/** The thumb always sits centred on its value: `edge` places it with an inline script, which needs a CSP nonce. */
type Owned = 'className' | 'ref' | 'aria-label' | 'aria-labelledby' | 'thumbAlignment' | keyof SliderDesignProps

// R-5.7-5: derived at the seam and generic as Base UI's is, so onValueChange hands a number or a pair.
export type SliderProps<Value extends SliderValue = number> = Omit<Base.Root.Props<Value>, Owned>
  & SliderDesignProps
  & {
    /** Merged last, so a consumer class wins a conflict with the slider's own. */
    className?: string | undefined
    /** The root element, the `<div role="group">`. */
    ref?: Ref<HTMLDivElement> | undefined
    /** Accepted so a Field can spread its object, and dropped: Base UI has none, and a slider always has a value. */
    required?: boolean | undefined
  }
  & SliderName

/** What Base UI hands a change handler: the reason, the thumb that moved, the event, and cancel(). */
export type SliderChangeDetails = Base.Root.ChangeEventDetails

/** What the hook holds and resolves: the value, the limits, the name, and the number format. */
export interface SliderStateProps {
  value?: SliderValue | undefined
  defaultValue?: SliderValue | undefined
  onValueChange?: ((value: SliderValue, details: SliderChangeDetails) => void) | undefined
  ref?: Ref<HTMLDivElement> | undefined
  /** From `invalid` or the aria-invalid a Field passes: each range input carries it too. */
  invalid: boolean
  min: number
  max: number
  step: number
  'aria-label'?: string | undefined
  'aria-labelledby'?: string | undefined
  'aria-describedby'?: string | undefined
  locale?: Intl.LocalesArgument | undefined
  format?: Intl.NumberFormatOptions | undefined
}
