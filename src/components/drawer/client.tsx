'use client'

import { Drawer as Base } from '@base-ui/react/drawer'

import { x } from '#icons/data/x.js'
import { POPUP_PASSIVE, VIEWPORT_PASSIVE } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { OverlayScopeContext } from '#shared/overlay-scope.js'
import { hasContent, renderTrigger } from '#shared/render-trigger.js'
import { Svg } from '#components/svg/index.js'
import {
  DRAWER_BACKDROP, DRAWER_BODY, DRAWER_CLOSE, DRAWER_DESCRIPTION, DRAWER_EDGE, DRAWER_FOOTER, DRAWER_GRABBER,
  DRAWER_HEADER, DRAWER_POPUP, DRAWER_TITLE, DRAWER_VIEWPORT, DRAWER_VIEWPORT_EDGE, DRAWER_WIDTH, DRAWER_X,
} from './classes.js'
import { DRAWER_DEFAULTS } from './constants.js'
import { DrawerContext, useDrawerBody, useDrawerClose, useDrawerPopup, useDrawerRoot } from './hook.js'
import { isSideSheet } from './lib.js'
import type {
  DrawerBodyProps, DrawerCloseProps, DrawerDescriptionProps, DrawerFooterProps, DrawerHeaderProps, DrawerPopupProps,
  DrawerRootProps, DrawerTitleProps, DrawerTriggerProps,
} from './types.js'

/** Groups one trigger with its sheet. It renders no element, so it takes no className, style or
 * ref. It owns the placement because it owns the gesture: Base UI's swipe is physical, so the
 * root hands it the one that leaves by the sheet's own edge, in the direction of the provider. */
export function DrawerRoot({
  placement = DRAWER_DEFAULTS.placement,
  size = DRAWER_DEFAULTS.size,
  modal = DRAWER_DEFAULTS.modal,
  onOpenChange,
  ...props
}: DrawerRootProps) {
  const root = useDrawerRoot(placement, size, modal, onOpenChange)
  return (
    <OverlayScopeContext value={root.scope}>
      <DrawerContext value={root.settings}>
        <Base.Root {...props} modal={modal} swipeDirection={root.swipeDirection} onOpenChange={root.onOpenChange} />
      </DrawerContext>
    </OverlayScopeContext>
  )
}

/** Base UI's trigger, styled by nothing of its own: pass the control as render. */
export function DrawerTrigger({ className, render, ...rest }: DrawerTriggerProps) {
  const trigger = renderTrigger(render, className)
  return <Base.Trigger {...rest} render={trigger.render} className={trigger.className} />
}

/** The portal, the scrim, the viewport and the sheet in one part. Rest props reach the sheet; the
 * viewport carries the dir and the lang of the provider, which a portal cannot inherit. A bottom
 * sheet starts with its grabber, and every sheet ends with the x: a swipe is a drag (WCAG 2.5.7). */
export function DrawerPopup({ container, keepMounted, className, children, ...rest }: DrawerPopupProps) {
  const { dir, lang, placement, size, modal, scope } = useDrawerPopup()
  const blocks = modal === true
  const portal = (
    <Base.Portal container={container} keepMounted={keepMounted}>
      {blocks ? <Base.Backdrop className={DRAWER_BACKDROP} /> : null}
      <Base.Viewport
        dir={dir}
        lang={lang}
        className={cn(DRAWER_VIEWPORT, DRAWER_VIEWPORT_EDGE[placement], !blocks && VIEWPORT_PASSIVE)}
      >
        <Base.Popup
          data-placement={placement}
          data-size={size}
          {...rest}
          data-overlay={scope}
          className={cn(
            DRAWER_POPUP, DRAWER_EDGE[placement], isSideSheet(placement) && DRAWER_WIDTH[size], !blocks && POPUP_PASSIVE, className,
          )}
        >
          {placement === 'bottom' ? <div aria-hidden="true" className={DRAWER_GRABBER} /> : null}
          {children}
          <DrawerClose className={DRAWER_X[placement]} />
        </Base.Popup>
      </Base.Viewport>
    </Base.Portal>
  )
  // Base UI's viewport reads this provider, so it wraps the portal: a field under the keyboard is scrolled clear of it.
  return placement === 'bottom' ? <Base.VirtualKeyboardProvider>{portal}</Base.VirtualKeyboardProvider> : portal
}

/** The bar that stays put above the body, for the title and the description. */
export function DrawerHeader({ className, ...rest }: DrawerHeaderProps) {
  return <div {...rest} className={cn(DRAWER_HEADER, className)} />
}

/** Base UI's title, an h2 that names the sheet. */
export function DrawerTitle({ className, ...rest }: DrawerTitleProps) {
  return <Base.Title {...rest} className={cn(DRAWER_TITLE, className)} />
}

/** Base UI's description, a paragraph the sheet is described by. */
export function DrawerDescription({ className, ...rest }: DrawerDescriptionProps) {
  return <Base.Description {...rest} className={cn(DRAWER_DESCRIPTION, className)} />
}

/** R-10.5-1: the scroll container, and Base UI's Content: a mouse drag in it selects text and
 * never moves the sheet. While it scrolls it is a tab stop, so the keyboard reaches a long text. */
export function DrawerBody({ ref, className, ...rest }: DrawerBodyProps) {
  const body = useDrawerBody(ref)
  return <Base.Content tabIndex={body.tabIndex} {...rest} ref={body.ref} className={cn(DRAWER_BODY, className)} />
}

/** The bar that stays put below the body, for the actions. */
export function DrawerFooter({ className, ...rest }: DrawerFooterProps) {
  return <div {...rest} className={cn(DRAWER_FOOTER, className)} />
}

/** Base UI's close. With render, or children that draw something, it is that control, with
 * no class of ours; otherwise it is the x, named by the provider's labels. */
export function DrawerClose({ className, render, children, ...rest }: DrawerCloseProps) {
  const { label } = useDrawerClose()
  if (render !== undefined || hasContent(children)) {
    const control = renderTrigger(render, className)
    return <Base.Close {...rest} render={control.render} className={control.className}>{children}</Base.Close>
  }
  return (
    <Base.Close aria-label={label} {...rest} className={cn(DRAWER_CLOSE, className)}>
      <Svg icon={x} />
    </Base.Close>
  )
}
