'use client'

import { Dialog as Base } from '@base-ui/react/dialog'

import { x } from '#icons/data/x.js'
import { cn } from '#shared/cn.js'
import { renderTrigger } from '#shared/render-trigger.js'
import { Svg } from '#components/svg/index.js'
import {
  DIALOG_BACKDROP, DIALOG_BODY, DIALOG_CLOSE, DIALOG_DESCRIPTION, DIALOG_FOOTER, DIALOG_HEADER, DIALOG_HEADING,
  DIALOG_POPUP, DIALOG_TITLE, DIALOG_VIEWPORT, DIALOG_WIDTH,
} from './classes.js'
import { DIALOG_DEFAULTS } from './constants.js'
import { useDialogClose, useDialogPopup } from './hook.js'
import type {
  DialogBodyProps, DialogCloseProps, DialogDescriptionProps, DialogFooterProps, DialogHeaderProps, DialogPopupProps,
  DialogRootProps, DialogTitleProps, DialogTriggerProps,
} from './types.js'

/** Groups one trigger with its popup. It renders no element, so it takes no className,
 * style or ref, and Base UI holds the open state, the focus trap and the scroll lock. */
export function DialogRoot<Payload>(props: DialogRootProps<Payload>) {
  return <Base.Root {...props} />
}

/** Base UI's trigger, styled by nothing of its own: pass the control as render. */
export function DialogTrigger<Payload>({ className, render, ...rest }: DialogTriggerProps<Payload>) {
  const trigger = renderTrigger(render, className)
  return <Base.Trigger {...rest} render={trigger.render} className={trigger.className} />
}

/** The portal, the scrim, the viewport and the popup in one part. Rest props reach the
 * popup; the viewport carries the direction of the provider, which a portal cannot inherit. */
export function DialogPopup({ size = DIALOG_DEFAULTS.size, className, ...rest }: DialogPopupProps) {
  const { direction } = useDialogPopup()
  return (
    <Base.Portal>
      <Base.Backdrop className={DIALOG_BACKDROP} />
      <Base.Viewport dir={direction} className={DIALOG_VIEWPORT}>
        <Base.Popup data-size={size} {...rest} className={cn(DIALOG_POPUP, DIALOG_WIDTH[size], className)} />
      </Base.Viewport>
    </Base.Portal>
  )
}

/** The bar that stays put above the body: the title and the description, then the x. */
export function DialogHeader({
  closeButton = DIALOG_DEFAULTS.closeButton,
  className,
  children,
  ...rest
}: DialogHeaderProps) {
  return (
    <div {...rest} className={cn(DIALOG_HEADER, className)}>
      <div className={DIALOG_HEADING}>{children}</div>
      {closeButton ? <DialogClose /> : null}
    </div>
  )
}

/** Base UI's title, an h2 that names the popup. */
export function DialogTitle({ className, ...rest }: DialogTitleProps) {
  return <Base.Title {...rest} className={cn(DIALOG_TITLE, className)} />
}

/** Base UI's description, a paragraph the popup is described by. */
export function DialogDescription({ className, ...rest }: DialogDescriptionProps) {
  return <Base.Description {...rest} className={cn(DIALOG_DESCRIPTION, className)} />
}

/** R-10.5-1: the scroll container. The header and the footer keep their boxes around it. */
export function DialogBody({ className, ...rest }: DialogBodyProps) {
  return <div {...rest} className={cn(DIALOG_BODY, className)} />
}

/** The bar that stays put below the body, for the actions. */
export function DialogFooter({ className, ...rest }: DialogFooterProps) {
  return <div {...rest} className={cn(DIALOG_FOOTER, className)} />
}

/** Base UI's close. With children or render it is that control, with no class of ours;
 * with neither it is the x, named by the provider's labels. */
export function DialogClose({ className, render, children, ...rest }: DialogCloseProps) {
  const { label } = useDialogClose()
  if (render !== undefined || children != null) {
    const control = renderTrigger(render, className)
    return <Base.Close {...rest} render={control.render} className={control.className}>{children}</Base.Close>
  }
  return (
    <Base.Close aria-label={label} {...rest} className={cn(DIALOG_CLOSE, className)}>
      <Svg icon={x} />
    </Base.Close>
  )
}
