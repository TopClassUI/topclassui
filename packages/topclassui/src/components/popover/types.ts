import type { Popover as Base } from '@base-ui/react/popover'
import type { ReactNode } from 'react'

import type { POPOVER_PLACEMENTS } from './constants.js'
import type { PopoverSchemaInput } from './schema.js'

export type PopoverPlacement = (typeof POPOVER_PLACEMENTS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type PopoverDesignProps = {
  [K in keyof PopoverSchemaInput]?: PopoverSchemaInput[K] | undefined
}

/** What every part that renders an element takes in place of Base UI's state function. */
interface OwnClassName {
  /** Merged last, so a consumer class wins a conflict with the part's own. */
  className?: string | undefined
}

// R-5.7-5: derived at the seam. No handle: nothing here creates one, so a trigger sits inside its root.
export type PopoverRootProps = Omit<Base.Root.Props, 'className' | 'handle' | 'children'> & {
  /** The trigger and the popup. With no trigger, hold `open` in a client file. */
  children?: ReactNode | undefined
}

/** The delays act only with openOnHover, and only a delay that is passed is clamped. */
export type PopoverTriggerProps =
  Omit<Base.Trigger.Props, 'className' | 'handle' | 'payload' | 'delay' | 'closeDelay'>
  & Pick<PopoverDesignProps, 'delay' | 'closeDelay'>
  & OwnClassName

/** The popup's own props, and the two of the portal around it: where it mounts, and whether
 * it stays mounted while closed. The positioner takes none, so the placement stays ours. */
export type PopoverPopupProps = Omit<Base.Popup.Props, 'className'>
  & Omit<Base.Portal.Props, 'className' | keyof Base.Popup.Props>
  & Pick<PopoverDesignProps, 'placement'>
  & OwnClassName

export type PopoverTitleProps = Omit<Base.Title.Props, 'className'> & OwnClassName

export type PopoverDescriptionProps = Omit<Base.Description.Props, 'className'> & OwnClassName

/** With no render and no children that draw anything it is the x, named by labels.common.close. */
export type PopoverCloseProps = Omit<Base.Close.Props, 'className'> & OwnClassName
