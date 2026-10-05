import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'

import type { Size } from '#shared/contracts/size.js'
import type { Tone } from '#shared/contracts/tone.js'
import type { BUTTON_VARIANTS } from './constants.js'
import type { ButtonSchemaInput } from './schema.js'

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
/** The shared vocabulary, so adding a tone reaches every component at once. */
export type ButtonTone = Tone

/** R-8.3-4: derived from the schema, so the props and the validation cannot drift apart. */
export type ButtonDesignProps = {
  [K in keyof ButtonSchemaInput]?: ButtonSchemaInput[K] | undefined
}

/** R-5.7-4: the element form only, so it resolves without a hook in a Server Component. */
export interface RenderProp {
  render?: ReactElement | undefined
}

export interface ButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'children'>, ButtonDesignProps, RenderProp {
  children?: ReactNode | undefined
}

export interface ButtonSkeletonProps {
  size?: Size | undefined
  fullWidth?: boolean | undefined
  className?: string | undefined
}
