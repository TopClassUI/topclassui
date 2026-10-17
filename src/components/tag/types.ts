import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Size } from '#shared/contracts/size.js'
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
  /** Shows a remove button that calls this; taking the tag out of the list is the caller's. Passed from a client component. */
  onRemove?: (() => void) | undefined
}

/** What the server half hands its button: two ids from useId, the look and the handler. Internal. */
export interface TagRemoveProps {
  id: string
  labelId: string
  tone: Tone
  size: Size
  onRemove: () => void
}

/** The removable tag, once its tone and size are settled. Internal. */
export type TagRemovableProps = Omit<TagProps, 'tone' | 'size' | 'onRemove'> & Pick<TagRemoveProps, 'tone' | 'size' | 'onRemove'>

/** R-8.3-4: the tag's own size prop, so the two cannot describe different boxes. */
export type TagSkeletonProps =
  Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & Pick<TagDesignProps, 'size'>
