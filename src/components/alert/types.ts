import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Tone } from '#shared/contracts/tone.js'
import type { ALERT_VARIANTS } from './constants.js'
import type { AlertSchemaInput } from './schema.js'

export type AlertVariant = (typeof ALERT_VARIANTS)[number]

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type AlertTone = Tone

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type AlertDesignProps = {
  [K in keyof AlertSchemaInput]?: AlertSchemaInput[K] | undefined
}

/** `title` is the heading of the message, so the native tooltip attribute is omitted, and
 * so is dangerouslySetInnerHTML, because the root always holds the icon and the body. */
export interface AlertProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'title' | 'dangerouslySetInnerHTML'>,
  AlertDesignProps {
  /** Shown before the text. Leave it out for the tone's own icon, or pass null for none. */
  icon?: ReactNode | undefined
  /** The heading of the message, in bold above the description. */
  title?: ReactNode | undefined
  /** The description: a sentence, several paragraphs or a list. */
  children?: ReactNode | undefined
  /** Buttons or links, in a row under the description. */
  actions?: ReactNode | undefined
}
