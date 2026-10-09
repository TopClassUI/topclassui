import type { Tooltip as Base } from '@base-ui/react/tooltip'

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

export type TooltipPopupProps =
  Omit<Base.Popup.Props, 'className' | 'children' | 'render'>
  & Pick<TooltipDesignProps, 'placement'>
  & {
    /** Merged last, so a consumer class wins a conflict with the popup's own. */
    className?: string | undefined
    /** Text only, never an element: a link or a control belongs in a Popover (R-10.5-2). */
    children?: TooltipText | readonly TooltipText[] | undefined
  }
