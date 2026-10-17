'use client'

import { Popover as Base } from '@base-ui/react/popover'

import { x } from '#icons/data/x.js'
import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { FLOATING, toSideAlign } from '#shared/floating.js'
import { guardEscape } from '#shared/overlay.js'
import { hasContent, renderTrigger } from '#shared/render-trigger.js'
import { Svg } from '#components/svg/index.js'
import { POPOVER_BOUNDARIES } from './boundaries.js'
import { POPOVER_CLOSE, POPOVER_DESCRIPTION, POPOVER_POPUP, POPOVER_POSITIONER, POPOVER_TITLE } from './classes.js'
import { POPOVER_DEFAULTS } from './constants.js'
import { PopoverScopeContext, usePopoverClose, usePopoverPopup, usePopoverPositioner, usePopoverRoot } from './hook.js'
import type {
  PopoverCloseProps, PopoverDescriptionProps, PopoverPopupProps, PopoverRootProps, PopoverTitleProps,
  PopoverTriggerProps,
} from './types.js'

const { delayMin, delayMax } = POPOVER_BOUNDARIES

/** Groups one trigger with its popup. It renders no element, so it takes no className, style
 * or ref, and Base UI holds the open state. An Escape meant for a popup opened inside its own
 * popup does not close it: the guard looks at this root's popup and at no other dialog. */
export function PopoverRoot({ onOpenChange, ...props }: PopoverRootProps) {
  const { scope, popups } = usePopoverRoot()
  return (
    <PopoverScopeContext value={scope}>
      <Base.Root {...props} onOpenChange={guardEscape(onOpenChange, popups)} />
    </PopoverScopeContext>
  )
}

/** Base UI's trigger, styled by nothing of its own: pass the control as render. A delay left
 * out reaches Base UI as undefined, so its own 300 and 0 apply; both act only with openOnHover. */
export function PopoverTrigger({ delay, closeDelay, className, render, ...rest }: PopoverTriggerProps) {
  const trigger = renderTrigger(render, className)
  return (
    <Base.Trigger
      {...rest}
      render={trigger.render}
      delay={delay === undefined ? undefined : clamp(delay, delayMin, delayMax)}
      closeDelay={closeDelay === undefined ? undefined : clamp(closeDelay, delayMin, delayMax)}
      className={trigger.className}
    />
  )
}

/** The portal, the positioner and the popup in one part. Rest props reach the popup; the
 * positioner takes none, and carries the dir and the lang of the provider for its portal. */
export function PopoverPopup({
  placement = POPOVER_DEFAULTS.placement,
  container,
  keepMounted,
  ...rest
}: PopoverPopupProps) {
  const { side, align } = toSideAlign(placement)
  const { dir, lang } = usePopoverPositioner()
  return (
    <Base.Portal container={container} keepMounted={keepMounted}>
      <Base.Positioner
        dir={dir}
        lang={lang}
        side={side}
        align={align}
        sideOffset={FLOATING.sideOffset}
        collisionPadding={FLOATING.collisionPadding}
        className={POPOVER_POSITIONER}
      >
        <PopoverSurface data-placement={placement} {...rest} />
      </Base.Positioner>
    </Base.Portal>
  )
}

/** R-10.5-1: the popup, which is the scroll container. A part of its own, mounted with the
 * portal, so its element exists when the tab stop is measured. While it scrolls it is a tab stop. */
function PopoverSurface({ ref, className, ...rest }: PopoverPopupProps) {
  const popup = usePopoverPopup(ref)
  return (
    <Base.Popup
      tabIndex={popup.tabIndex}
      {...rest}
      data-popover={popup.scope}
      ref={popup.ref}
      className={cn(POPOVER_POPUP, className)}
    />
  )
}

/** Base UI's title, an h2 that names the popup. */
export function PopoverTitle({ className, ...rest }: PopoverTitleProps) {
  return <Base.Title {...rest} className={cn(POPOVER_TITLE, className)} />
}

/** Base UI's description, a paragraph the popup is described by. */
export function PopoverDescription({ className, ...rest }: PopoverDescriptionProps) {
  return <Base.Description {...rest} className={cn(POPOVER_DESCRIPTION, className)} />
}

/** Base UI's close. With render, or children that draw something, it is that control, with
 * no class of ours; otherwise it is the x, named by the provider's labels. The caller places it. */
export function PopoverClose({ className, render, children, ...rest }: PopoverCloseProps) {
  const { label } = usePopoverClose()
  if (render !== undefined || hasContent(children)) {
    const control = renderTrigger(render, className)
    return <Base.Close {...rest} render={control.render} className={control.className}>{children}</Base.Close>
  }
  return (
    <Base.Close aria-label={label} {...rest} className={cn(POPOVER_CLOSE, className)}>
      <Svg icon={x} />
    </Base.Close>
  )
}
