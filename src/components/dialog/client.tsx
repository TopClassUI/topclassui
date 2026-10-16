'use client'

import { Dialog as Base } from '@base-ui/react/dialog'

import { x } from '#icons/data/x.js'
import { cn } from '#shared/cn.js'
import { renderTrigger } from '#shared/render-trigger.js'
import { Svg } from '#components/svg/index.js'
import {
  DIALOG_BACKDROP, DIALOG_BODY, DIALOG_CLOSE, DIALOG_DESCRIPTION, DIALOG_FOOTER, DIALOG_HEADER, DIALOG_HEADING,
  DIALOG_POPUP, DIALOG_POPUP_PASSIVE, DIALOG_TITLE, DIALOG_VIEWPORT, DIALOG_VIEWPORT_PASSIVE, DIALOG_WIDTH,
} from './classes.js'
import { DIALOG_DEFAULTS } from './constants.js'
import { DialogModalContext, useDialogBody, useDialogClose, useDialogPopup } from './hook.js'
import { guardEscape, hasContent } from './lib.js'
import type {
  DialogBodyProps, DialogCloseProps, DialogDescriptionProps, DialogFooterProps, DialogHeaderProps, DialogPopupProps,
  DialogRootProps, DialogTitleProps, DialogTriggerProps,
} from './types.js'

/** Groups one trigger with its popup. It renders no element, so it takes no className,
 * style or ref. Base UI holds the open state, the focus trap and the scroll lock; the root
 * shares modal with its popup, and keeps an Escape meant for a popup inside it from closing it. */
export function DialogRoot({ modal = DIALOG_DEFAULTS.modal, onOpenChange, ...props }: DialogRootProps) {
  return (
    <DialogModalContext value={modal}>
      <Base.Root {...props} modal={modal} onOpenChange={guardEscape(onOpenChange)} />
    </DialogModalContext>
  )
}

/** Base UI's trigger, styled by nothing of its own: pass the control as render. */
export function DialogTrigger({ className, render, ...rest }: DialogTriggerProps) {
  const trigger = renderTrigger(render, className)
  return <Base.Trigger {...rest} render={trigger.render} className={trigger.className} />
}

/** The portal, the scrim, the viewport and the popup in one part. Rest props reach the
 * popup; the viewport carries the dir and the lang of the provider, which a portal cannot inherit.
 * Only a modal dialog gets the scrim: any other leaves the page behind it to the pointer. */
export function DialogPopup({
  size = DIALOG_DEFAULTS.size,
  container,
  keepMounted,
  className,
  ...rest
}: DialogPopupProps) {
  const { dir, lang, modal } = useDialogPopup()
  const blocks = modal === true
  return (
    <Base.Portal container={container} keepMounted={keepMounted}>
      {blocks ? <Base.Backdrop className={DIALOG_BACKDROP} /> : null}
      <Base.Viewport dir={dir} lang={lang} className={cn(DIALOG_VIEWPORT, !blocks && DIALOG_VIEWPORT_PASSIVE)}>
        <Base.Popup
          data-size={size}
          {...rest}
          className={cn(DIALOG_POPUP, !blocks && DIALOG_POPUP_PASSIVE, DIALOG_WIDTH[size], className)}
        />
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

/** R-10.5-1: the scroll container. The header and the footer keep their boxes around it.
 * While it scrolls it is a tab stop, so the keyboard reaches a text that holds no control. */
export function DialogBody({ ref, className, ...rest }: DialogBodyProps) {
  const body = useDialogBody(ref)
  return <div tabIndex={body.tabIndex} {...rest} ref={body.ref} className={cn(DIALOG_BODY, className)} />
}

/** The bar that stays put below the body, for the actions. */
export function DialogFooter({ className, ...rest }: DialogFooterProps) {
  return <div {...rest} className={cn(DIALOG_FOOTER, className)} />
}

/** Base UI's close. With render, or children that draw something, it is that control, with
 * no class of ours; otherwise it is the x, named by the provider's labels. */
export function DialogClose({ className, render, children, ...rest }: DialogCloseProps) {
  const { label } = useDialogClose()
  if (render !== undefined || hasContent(children)) {
    const control = renderTrigger(render, className)
    return <Base.Close {...rest} render={control.render} className={control.className}>{children}</Base.Close>
  }
  return (
    <Base.Close aria-label={label} {...rest} className={cn(DIALOG_CLOSE, className)}>
      <Svg icon={x} />
    </Base.Close>
  )
}
