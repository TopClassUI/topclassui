import type { ComponentPropsWithRef } from 'react'

import type { Tone } from '#shared/contracts/tone.js'
import type { MeterSchemaInput } from './schema.js'

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type MeterTone = Tone

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type MeterDesignProps = {
  [K in keyof MeterSchemaInput]?: MeterSchemaInput[K] | undefined
}

/** R-5.6-1: Meter renders no text, so a caller must name it one of two ways. */
export type MeterName =
  | {
    /** The name read out when no visible text names the meter. */
    'aria-label': string
    'aria-labelledby'?: string | undefined
  }
  | {
    'aria-label'?: string | undefined
    /** The id of the visible text that names the meter. */
    'aria-labelledby': string
  }

/** No content, and the role and the three values the component writes after the clamp. */
type Owned =
  'children' | 'dangerouslySetInnerHTML' | 'role' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuenow'

export type MeterProps =
  Omit<ComponentPropsWithRef<'div'>, Owned>
  & MeterDesignProps
  & MeterName

/** Both ends and the value of a meter after the guard rail, `max` never below `min`. */
export interface MeterRange { min: number; max: number; value: number }
