import type { Menu as Base } from '@base-ui/react/menu'
import type { ReactNode } from 'react'

import type { MenuContract } from '#shared/contracts/menu.js'
import type { DROPDOWN_ITEM_TONES, DROPDOWN_PLACEMENTS } from './constants.js'
import type { DropdownSchemaInput } from './schema.js'

export type DropdownPlacement = (typeof DROPDOWN_PLACEMENTS)[number]

export type DropdownItemTone = (typeof DROPDOWN_ITEM_TONES)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type DropdownDesignProps = {
  [K in keyof DropdownSchemaInput]?: DropdownSchemaInput[K] | undefined
}

/** What every part that renders an element takes in place of Base UI's state function. */
interface OwnClassName {
  /** Merged last, so a consumer class wins a conflict with the part's own. */
  className?: string | undefined
}

/** What a row draws around its label. */
interface OwnRow {
  /** Drawn before the label. An element, such as `<Svg icon={trash} />`: it is not a name. */
  icon?: ReactNode | undefined
  /** Shown at the end of the row, such as `Ctrl P`. It is read out after the label. */
  shortcut?: string | undefined
}

/** R-5.6-1: a row is named by its text. A row with no text, an icon alone, takes aria-label. */
/** What one row draws: the icon, the label and the shortcut. */
export interface DropdownRowProps extends OwnRow {
  label: ReactNode
}

type Named =
  | { children: ReactNode }
  | { 'children'?: undefined, 'aria-label': string }

// R-5.7-5: derived at the seam. No handle: nothing here creates one, so a trigger sits inside its root.
export type DropdownRootProps = Omit<Base.Root.Props, 'className' | 'handle' | 'children'> & {
  /** The trigger and the popup. With no trigger, hold `open` in a client file. */
  children?: ReactNode | undefined
}

/** The delays act only with openOnHover, and only a delay that is passed is clamped. */
export type DropdownTriggerProps =
  Omit<Base.Trigger.Props, 'className' | 'handle' | 'payload' | 'delay' | 'closeDelay'>
  & Pick<DropdownDesignProps, 'delay' | 'closeDelay'>
  & OwnClassName

/** The popup's own props, and the two of the portal around it: where it mounts, and whether
 * it stays mounted while closed. The positioner takes none, so the placement stays ours. */
export type DropdownPopupProps = Omit<Base.Popup.Props, 'className'>
  & Pick<Base.Portal.Props, 'container' | 'keepMounted'>
  & Pick<DropdownDesignProps, 'placement'>
  & OwnClassName

export type DropdownItemProps = Omit<Base.Item.Props, 'className' | 'children'>
  & OwnRow & Pick<DropdownDesignProps, 'tone'> & OwnClassName & Named

/** A real anchor. Base UI gives a link item no disabled: a row that goes nowhere is a DropdownItem. */
export type DropdownLinkItemProps = Omit<Base.LinkItem.Props, 'className' | 'children'>
  & OwnRow & Pick<DropdownDesignProps, 'tone'> & OwnClassName & Named

export type DropdownGroupProps = Omit<Base.Group.Props, 'className'> & OwnClassName

export type DropdownGroupLabelProps = Omit<Base.GroupLabel.Props, 'className'> & OwnClassName

export type DropdownSeparatorProps = Omit<Base.Separator.Props, 'className'> & OwnClassName

/** The shared menu contract, so a Drawer menu takes the same data; the rest, the className and the ref reach the popup. */
export type DropdownMenuProps = MenuContract & Omit<DropdownPopupProps, keyof MenuContract | 'children' | 'container' | 'keepMounted' | 'render'>
