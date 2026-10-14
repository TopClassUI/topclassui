import type { Toast as Base } from '@base-ui/react/toast'
import type { ReactNode } from 'react'

import type { ToastPlacement } from '#shared/contracts/toast.js'
import type { Tone } from '#shared/contracts/tone.js'
import type { TOAST_ICONS } from './constants.js'
import type { ToastSchemaInput } from './schema.js'

export type { ToastPlacement }

/** The shared vocabulary, so a new tone reaches every component at once. */
export type ToastTone = Tone

/** A type of Base UI's that draws an icon: four tones, and the two a promise writes. */
export type ToastIconType = keyof typeof TOAST_ICONS

/** Base UI's physical names for a swipe that closes a toast; lib.ts works them out from the placement. */
export type ToastSwipeDirection = Extract<NonNullable<Base.Root.Props['swipeDirection']>, string>

/** One entry of Base UI's list, an ending one included: it leaves the list only once its Root has faded it out. */
export type ToastEntry = Base.Root.Props['toast']

// R-8.3-4: derived from the schema, so the options and the validation cannot drift apart.
export type ToastDesignProps = {
  [K in keyof ToastSchemaInput]?: ToastSchemaInput[K] | undefined
}

/** One button beside the text. It does not close the toast: call `toast.close(id)` in `onClick` for that. */
export interface ToastAction {
  label: string
  onClick: () => void
}

/** What `toast.add` takes. Every key is optional; a toast with neither text is an empty box. */
export type ToastOptions = ToastDesignProps & {
  title?: ReactNode
  description?: ReactNode
  action?: ToastAction | undefined
}

/** One step of `toast.promise`: a title, or the options. Its icon is the step's own, so it takes no tone. */
export type ToastStep = string | Omit<ToastOptions, 'tone'>

export interface ToastPromiseSteps<Value> {
  loading: ToastStep
  success: ToastStep | ((value: Value) => ToastStep)
  error: ToastStep | ((error: unknown) => ToastStep)
}

/** What the viewport hands each toast it draws. Not exported from index.tsx: no toast is drawn by hand. */
export interface ToastItemProps {
  entry: ToastEntry
  swipeDirection: ToastSwipeDirection[]
  closeLabel: string
}

/** The provider mounts the one viewport; a class is all it takes. */
export interface ToastViewportProps {
  /** Merged last, so a consumer class wins a conflict with the viewport's own. */
  className?: string | undefined
}
