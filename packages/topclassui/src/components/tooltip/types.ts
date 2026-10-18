import type { Tooltip as Base } from '@base-ui/react/tooltip'
import type { ReactElement } from 'react'

import type { TOOLTIP_PLACEMENTS } from './constants.js'
import type { TooltipSchemaInput } from './schema.js'

export type TooltipPlacement = (typeof TOOLTIP_PLACEMENTS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type TooltipDesignProps = {
  [K in keyof TooltipSchemaInput]?: TooltipSchemaInput[K] | undefined
}

/** One run of text. JSX passes `Delete {count} rows` as an array of these. */
export type TooltipText = string | number

// R-5.7-5: derived at the seam with Base UI's Payload, so a typed handle still types the payload.
export type TooltipRootProps<Payload = unknown> = Omit<Base.Root.Props<Payload>, 'className'>

export type TooltipTriggerProps<Payload = unknown> =
  Omit<Base.Trigger.Props<Payload>, 'className' | 'delay' | 'closeDelay'>
  & Pick<TooltipDesignProps, 'delay' | 'closeDelay'>
  & {
    /** Merged with cn() after the render element's own classes, so it wins a conflict
     * even when a Server Component hands that element over already rendered. */
    className?: string | undefined
  }

/** What a root shares with its parts: the popup id, and how a caller's id on the popup replaces it. */
export interface TooltipPopupId {
  popupId: string | undefined
  setOwnId: (id: string | undefined) => void
}

/** What TooltipTrigger's render function hands on: the caller's render, Base UI's props and state. */
export interface TooltipTriggerElementProps {
  render: ReactElement | Base.Trigger.Props['render']
  props: Parameters<Extract<Base.Trigger.Props['render'], (...args: never[]) => unknown>>[0]
  state: Base.Trigger.State
}

export type TooltipPopupProps =
  Omit<Base.Popup.Props, 'className' | 'children' | 'render' | 'dangerouslySetInnerHTML'>
  & Pick<TooltipDesignProps, 'placement'>
  & {
    /** Merged last, so a consumer class wins a conflict with the popup's own. */
    className?: string | undefined
    /** Text only, never an element: a link or a control belongs in a Popover (R-10.5-2). */
    children?: TooltipText | readonly TooltipText[] | undefined
  }
