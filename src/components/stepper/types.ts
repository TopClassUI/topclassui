import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Labels } from '#shared/labels/types.js'
import type { STEPPER_STATUSES } from './constants.js'
import type { StepperSchemaInput } from './schema.js'

export type StepperStatus = (typeof STEPPER_STATUSES)[number]

/** One step: plain data, so a server page passes the list as it is. */
export interface StepperItem {
  /** The step's identity: its React key, and what `value` names. */
  id: string
  /** The step's name under its circle. Any node; a long one wraps inside its column. */
  title: ReactNode
  /** Wins over the status worked out from `value`. `error` draws an x and is read as needing attention. */
  status?: StepperStatus | undefined
}

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type StepperDesignProps = {
  [K in keyof StepperSchemaInput]?: StepperSchemaInput[K] | undefined
}

/** An `<ol>` built from `items` and holding its own role. `defaultValue` is left out too: the
 * catalog's sample writes it, and the current step is `value` here (choice 10). */
type Owned = 'children' | 'dangerouslySetInnerHTML' | 'role' | 'defaultValue'

export interface StepperProps extends Omit<ComponentPropsWithRef<'ol'>, Owned>, StepperDesignProps {
  /** The steps, first to last. A connector runs from each circle to the next. */
  items: readonly StepperItem[]
  /** The id of the current step: those before it are done, those after it todo. Defaults to the first step's id. */
  value?: string | undefined
  /** The built-in strings, which say each step's status. Defaults to English; spread `getLabels(locale)` for another. */
  labels?: Labels | undefined
  /** The locale the step numbers are written in: `ar-u-nu-arab` gives Arabic-Indic digits. Defaults to `en`. */
  locale?: string | undefined
}
