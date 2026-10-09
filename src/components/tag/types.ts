import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Tone } from '#shared/contracts/tone.js'
import type { TagSchemaInput } from './schema.js'

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type TagTone = Tone

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type TagDesignProps = {
  [K in keyof TagSchemaInput]?: TagSchemaInput[K] | undefined
}

export interface TagProps
  extends Omit<ComponentPropsWithRef<'span'>, 'children'>, TagDesignProps {
  /** The label, and any icon beside it. The text carries the meaning; colour never does alone. */
  children?: ReactNode | undefined
}
