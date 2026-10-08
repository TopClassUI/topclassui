import type { ComponentPropsWithRef } from 'react'

import type { Tone } from '#shared/contracts/tone.js'
import type { ProgressSchemaInput } from './schema.js'

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type ProgressTone = Tone

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type ProgressDesignProps = {
  [K in keyof ProgressSchemaInput]?: ProgressSchemaInput[K] | undefined
}

/** R-5.6-1: Progress renders no text, so a caller must name it one of two ways. */
export type ProgressName =
  | {
    /** The name read out when no visible text names the bar. */
    'aria-label': string
    'aria-labelledby'?: string | undefined
  }
  | {
    'aria-label'?: string | undefined
    /** The id of the visible text that names the bar. */
    'aria-labelledby': string
  }

/** No content, and the role and the three values the component writes after the clamp. */
type Owned =
  'children' | 'dangerouslySetInnerHTML' | 'role' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuenow'

export type ProgressProps =
  Omit<ComponentPropsWithRef<'div'>, Owned>
  & ProgressDesignProps
  & ProgressName
