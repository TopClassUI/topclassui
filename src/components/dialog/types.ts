import type { Dialog as Base } from '@base-ui/react/dialog'
import type { ComponentPropsWithRef } from 'react'

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

// R-5.7-5: derived at the seam with Base UI's Payload, so a typed handle still types the payload.
export type DialogRootProps<Payload = unknown> = Omit<Base.Root.Props<Payload>, 'className'>

export type DialogTriggerProps<Payload = unknown> = Omit<Base.Trigger.Props<Payload>, 'className'> & OwnClassName

/** The popup's own props: the portal, the scrim and the viewport around it take none. */
export type DialogPopupProps = Omit<Base.Popup.Props, 'className'> & Pick<DialogDesignProps, 'size'> & OwnClassName

export type DialogHeaderProps = Omit<ComponentPropsWithRef<'div'>, 'className'>
  & Pick<DialogDesignProps, 'closeButton'> & OwnClassName

export type DialogTitleProps = Omit<Base.Title.Props, 'className'> & OwnClassName

export type DialogDescriptionProps = Omit<Base.Description.Props, 'className'> & OwnClassName

export type DialogBodyProps = Omit<ComponentPropsWithRef<'div'>, 'className'> & OwnClassName

export type DialogFooterProps = Omit<ComponentPropsWithRef<'div'>, 'className'> & OwnClassName

/** With neither children nor render it is the x, named by labels.dialog.close. */
export type DialogCloseProps = Omit<Base.Close.Props, 'className'> & OwnClassName
