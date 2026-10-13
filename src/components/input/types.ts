import type { ComponentPropsWithRef } from 'react'

import type { InputSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type InputDesignProps = {
  [K in keyof InputSchemaInput]?: InputSchemaInput[K] | undefined
}

/** The two props that decide the look, which `inputVariants` takes on its own. */
export type InputVariantProps = Pick<InputDesignProps, 'size' | 'fullWidth'> & {
  className?: string | undefined
  class?: string | undefined
}

/** R-5.6-1: an input renders no text of its own, so a caller names it one of three ways. */
export type InputName =
  | {
    /** The id a `<label htmlFor>` points at. */
    id: string
    'aria-label'?: string | undefined
    'aria-labelledby'?: string | undefined
  }
  | {
    id?: string | undefined
    /** The name read out when no visible label names the input. */
    'aria-label': string
    'aria-labelledby'?: string | undefined
  }
  | {
    id?: string | undefined
    'aria-label'?: string | undefined
    /** The id of the visible text that names the input. */
    'aria-labelledby': string
  }

/** A void element, the native `size` (a width in characters) and the cap this widens. */
type Owned = 'children' | 'dangerouslySetInnerHTML' | 'size' | 'maxLength'

export type InputProps =
  Omit<ComponentPropsWithRef<'input'>, Owned>
  & InputDesignProps
  & {
    /** The character cap: your number, the default of the `type`, or `null` for none. */
    maxLength?: number | null | undefined
  }
  & InputName

/** R-8.3-4: the control's own size and width props, so the two cannot describe different boxes. */
export type InputSkeletonProps =
  Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & Pick<InputDesignProps, 'size' | 'fullWidth'>
