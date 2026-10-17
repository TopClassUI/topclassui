import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { Tone } from '#shared/contracts/tone.js'
import type { BannerSchemaInput } from './schema.js'

/** The shared vocabulary, so adding a tone reaches every component at once. */
export type BannerTone = Tone

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type BannerDesignProps = {
  [K in keyof BannerSchemaInput]?: BannerSchemaInput[K] | undefined
}

/** R-5.6-1: a region with no name is not a landmark, so a caller names it one of two ways. */
export type BannerName =
  | {
    /** The name of the landmark, such as "Release announcement". */
    'aria-label': string
    'aria-labelledby'?: string | undefined
  }
  | {
    'aria-label'?: string | undefined
    /** The id of the visible text that names the landmark. */
    'aria-labelledby': string
  }

/** A banner the visitor can dismiss needs an id: the dismissal is remembered by it.
 * A boolean decided at runtime takes this branch too, so it needs the id whatever its value. */
export type BannerDismissal =
  | {
    dismissible: boolean
    /** The key the dismissal is remembered under, and the element's id. Required with `dismissible`. */
    id: string
  }
  | {
    dismissible?: false | undefined
    id?: string | undefined
  }

/** The content, and the role the component writes itself. */
type Owned = 'children' | 'dangerouslySetInnerHTML' | 'role'

export interface BannerOwnProps {
  /** Shown before the message, such as a 16 px Svg. Leave it out for none. */
  icon?: ReactNode | undefined
  /** The message: a sentence that wraps and is never cut. */
  children?: ReactNode | undefined
  /** The caller's link or Button, after the message. */
  action?: ReactNode | undefined
}

export type BannerProps =
  Omit<ComponentPropsWithRef<'div'>, Owned | 'id'>
  & BannerDesignProps
  & BannerOwnProps
  & BannerName
  & BannerDismissal

/** A Banner that is always dismissible, with a handler. A client export: a Server Component passes onDismiss only as a Server Action. */
export type BannerDismissibleProps =
  Omit<ComponentPropsWithRef<'div'>, Owned | 'id'>
  & Omit<BannerDesignProps, 'dismissible'>
  & BannerOwnProps
  & BannerName
  & {
    /** The key the dismissal is remembered under, and the element's id. */
    id: string
    /** Called once when the x is pressed, while the banner is still in the page. */
    onDismiss?: (() => void) | undefined
  }

/** What index.tsx and BannerDismissible hand the client shell: the root's attributes, with the id and the tone it reads. */
export type BannerShellProps = Omit<ComponentPropsWithRef<'div'>, 'id'> & {
  'id': string
  'data-tone': BannerTone
  'onDismiss'?: (() => void) | undefined
}
