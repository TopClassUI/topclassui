import type { Dialog as Base } from '@base-ui/react/dialog'
import type { ComponentPropsWithRef, ReactNode } from 'react'

import type { DialogSchemaInput } from './schema.js'

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type DialogDesignProps = {
  [K in keyof DialogSchemaInput]?: DialogSchemaInput[K] | undefined
}

/** What every part that renders an element takes in place of Base UI's state function. */
interface OwnClassName {
  /** Merged last, so a consumer class wins a conflict with the part's own. */
  className?: string | undefined
}

/** Base UI's three: true, false and 'trap-focus'. The root shares it with its popup. */
export type DialogModal = NonNullable<Base.Root.Props['modal']>

// R-5.7-5: derived at the seam. No handle: nothing here creates one, so a trigger sits inside its root.
export type DialogRootProps = Omit<Base.Root.Props, 'className' | 'handle' | 'children'> & {
  /** The trigger and the popup. With no trigger, hold `open` in a client file. */
  children?: ReactNode | undefined
}

export type DialogTriggerProps = Omit<Base.Trigger.Props, 'className' | 'handle' | 'payload'> & OwnClassName

/** The popup's own props, and the two of the portal around it: where it mounts, and whether
 * it stays mounted while closed. The scrim and the viewport take none. */
export type DialogPopupProps = Omit<Base.Popup.Props, 'className'>
  & Pick<Base.Portal.Props, 'container' | 'keepMounted'>
  & Pick<DialogDesignProps, 'size'>
  & OwnClassName

export type DialogHeaderProps = Omit<ComponentPropsWithRef<'div'>, 'className'>
  & Pick<DialogDesignProps, 'closeButton'> & OwnClassName

export type DialogTitleProps = Omit<Base.Title.Props, 'className'> & OwnClassName

export type DialogDescriptionProps = Omit<Base.Description.Props, 'className'> & OwnClassName

export type DialogBodyProps = Omit<ComponentPropsWithRef<'div'>, 'className'> & OwnClassName

export type DialogFooterProps = Omit<ComponentPropsWithRef<'div'>, 'className'> & OwnClassName

/** With no render and no children that draw anything it is the x, named by labels.dialog.close. */
export type DialogCloseProps = Omit<Base.Close.Props, 'className'> & OwnClassName
