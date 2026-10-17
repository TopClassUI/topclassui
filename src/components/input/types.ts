import type { ComponentPropsWithRef, ReactElement } from 'react'

import type { ControlName } from '#shared/contracts/name.js'
import type { ValueRules } from '#shared/value-check/lib.js'
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
export type InputName = ControlName

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

/** What crosses from the server half to the holder of the check: the rules as plain values and the one input. */
export interface InputCheckProps {
  rules: ValueRules
  children: ReactElement
}

/** What the holder's hook reads. */
export type InputCheckValueProps = Pick<InputCheckProps, 'rules'>
