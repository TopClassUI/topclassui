import type { Drawer as Base } from '@base-ui/react/drawer'
import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { DRAWER_PLACEMENTS } from './constants.js'
import type { DrawerSchemaInput } from './schema.js'

/** The edge a sheet slides from. Logical: `start` is the left in LTR and the right in RTL. */
export type DrawerPlacement = (typeof DRAWER_PLACEMENTS)[number]

/** Base UI's name for the swipe that closes a sheet: a physical direction, which lib.ts works out. */
export type DrawerSwipeDirection = NonNullable<Base.Root.Props['swipeDirection']>

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type DrawerDesignProps = {
  [K in keyof DrawerSchemaInput]?: DrawerSchemaInput[K] | undefined
}

/** What every part that renders an element takes in place of Base UI's state function. */
interface OwnClassName {
  /** Merged last, so a consumer class wins a conflict with the part's own. */
  className?: string | undefined
}

/** Base UI's three: true, false and 'trap-focus'. The root shares it with its popup. */
export type DrawerModal = NonNullable<Base.Root.Props['modal']>

/** What the root hands its popup: Base UI tells the popup none of the three. */
export interface DrawerSettings {
  placement: DrawerPlacement
  size: NonNullable<DrawerDesignProps['size']>
  modal: DrawerModal
}

/** The swipe is worked out from `placement`, nothing here creates a handle, and no class moves a sheet to a snap point. */
type NotBuilt =
  'handle' | 'swipeDirection' | 'snapPoints' | 'snapPoint' | 'defaultSnapPoint' | 'snapToSequentialPoints' | 'onSnapPointChange'

// R-5.7-5: derived at the seam. The root owns the placement because it owns the gesture.
export type DrawerRootProps = Omit<Base.Root.Props, 'className' | 'children' | NotBuilt> & DrawerDesignProps & {
  /** The trigger and the popup. With no trigger, hold `open` in a client file. */
  children?: ReactNode | undefined
}

export type DrawerTriggerProps = Omit<Base.Trigger.Props, 'className' | 'handle' | 'payload'> & OwnClassName

/** The popup's own props, and the two of the portal around it: where it mounts, and whether
 * it stays mounted while closed. The scrim and the viewport take none. */
export type DrawerPopupProps = Omit<Base.Popup.Props, 'className'>
  & Omit<Base.Portal.Props, 'className' | keyof Base.Popup.Props>
  & OwnClassName

export type DrawerHeaderProps = Omit<ComponentPropsWithRef<'div'>, 'className'> & OwnClassName

export type DrawerTitleProps = Omit<Base.Title.Props, 'className'> & OwnClassName

export type DrawerDescriptionProps = Omit<Base.Description.Props, 'className'> & OwnClassName

/** Base UI's Content: inside it a mouse drag selects text and never moves the sheet. */
export type DrawerBodyProps = Omit<Base.Content.Props, 'className'> & OwnClassName

export type DrawerFooterProps = Omit<ComponentPropsWithRef<'div'>, 'className'> & OwnClassName

/** With no render and no children that draw anything it is the x, named by labels.drawer.close. */
export type DrawerCloseProps = Omit<Base.Close.Props, 'className'> & OwnClassName
