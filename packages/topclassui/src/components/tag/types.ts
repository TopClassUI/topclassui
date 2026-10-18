import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react'

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

/** A Tag with an x. A client export: a client component passes the handler, a Server Component only a Server Action. */
export interface TagRemovableProps extends TagProps {
  /** Client-only, or a Server Action: called with nothing when the x is pressed; taking the tag out of the list is the caller's. */
  onRemove: () => void
}

/** The press on the x, which the hook reads to know whether the x held the focus. Internal. */
export type TagRemoveEvent = MouseEvent<HTMLButtonElement>
