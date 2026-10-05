import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'

import type { Tone } from '#shared/contracts/tone.js'
import type { BUTTON_VARIANTS } from './constants.js'
import type { ButtonSchemaInput } from './schema.js'

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
/** The shared vocabulary, so adding a tone reaches every component at once. */
export type ButtonTone = Tone

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type ButtonDesignProps = {
  [K in keyof ButtonSchemaInput]?: ButtonSchemaInput[K] | undefined
}

/** The four props that decide the look, which `buttonVariants` takes on its own. */
export type ButtonVariantProps = Pick<ButtonDesignProps, 'variant' | 'tone' | 'size' | 'fullWidth'> & {
  className?: string | undefined
  class?: string | undefined
}

/** The attributes only a real `<button>` has; an anchor or a div must not take them. */
type NativeOnly =
  'type' | 'name' | 'value' | 'form'
  | 'formAction' | 'formEncType' | 'formMethod' | 'formNoValidate' | 'formTarget'

// R-5.7-4: the element form only, so it resolves without a hook in a Server Component.
export interface RenderProp {
  /** Render as another element, for example a framework link. */
  render?: ReactElement | undefined
}

/** Declared on both halves, so the component can still destructure them. */
type AsButton = { render?: undefined } & Pick<ComponentPropsWithRef<'button'>, NativeOnly>
type AsSomethingElse = { render: ReactElement } & { [K in NativeOnly]?: never }

export type ButtonProps =
  Omit<ComponentPropsWithRef<'button'>, 'children' | 'render' | NativeOnly>
  & ButtonDesignProps
  & { children?: ReactNode | undefined }
  & (AsButton | AsSomethingElse)

/** R-8.3-4: the control's own design props, so the two cannot describe different boxes. */
export type ButtonSkeletonProps =
  Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-hidden'>
  & Pick<ButtonDesignProps, 'size' | 'fullWidth'>
