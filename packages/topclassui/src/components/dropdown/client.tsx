'use client'

import { Menu as Base } from '@base-ui/react/menu'
import { Fragment } from 'react'

import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { FLOATING, toSideAlign } from '#shared/floating.js'
import { guardEscape } from '#shared/overlay.js'
import { renderTrigger } from '#shared/render-trigger.js'
import { DROPDOWN_BOUNDARIES } from './boundaries.js'
import {
  DROPDOWN_GROUP, DROPDOWN_ITEM, DROPDOWN_ITEM_TONE, DROPDOWN_POPUP, DROPDOWN_POSITIONER, DROPDOWN_SEPARATOR,
} from './classes.js'
import { DROPDOWN_DEFAULTS } from './constants.js'
import { DropdownScopeContext, useDropdownMenu, useDropdownPopup, useDropdownPositioner, useDropdownRoot } from './hook.js'
import { renderRow, toLinkElement, toRowProps } from './lib.js'
import { DropdownGroupLabel } from './parts/dropdown-group-label.js'
import type {
  DropdownGroupProps, DropdownItemProps, DropdownLinkItemProps, DropdownMenuProps, DropdownPopupProps,
  DropdownRootProps, DropdownSeparatorProps, DropdownTriggerProps,
} from './types.js'

const { delayMin, delayMax } = DROPDOWN_BOUNDARIES

// R-9.2-4: the lint reads DropdownGroup as the root of a DropdownGroupLabel declared beside it, so the label is a part file.
export { DropdownGroupLabel }

/** Groups one trigger with its menu. It renders no element, so it takes no className, style or
 * ref, and Base UI holds the open state. An Escape meant for a popup opened inside its own menu
 * does not close it: the guard looks at this root's popup and at no dialog around its trigger. */
export function DropdownRoot({ onOpenChange, ...props }: DropdownRootProps) {
  const { scope, popups } = useDropdownRoot()
  return (
    <DropdownScopeContext value={scope}>
      <Base.Root {...props} onOpenChange={guardEscape(onOpenChange, popups)} />
    </DropdownScopeContext>
  )
}

/** Base UI's trigger, styled by nothing of its own: pass the control as render. A delay left
 * out reaches Base UI as undefined, so its own 100 and 0 apply; both act only with openOnHover. */
export function DropdownTrigger({ delay, closeDelay, className, render, ...rest }: DropdownTriggerProps) {
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

/** The portal, the positioner and the menu in one part. Rest props reach the menu; the
 * positioner takes none, and carries the dir and the lang of the provider for its portal. */
export function DropdownPopup({
  placement = DROPDOWN_DEFAULTS.placement,
  container,
  keepMounted,
  ...rest
}: DropdownPopupProps) {
  const { side, align } = toSideAlign(placement)
  const { dir, lang } = useDropdownPositioner()
  return (
    <Base.Portal container={container} keepMounted={keepMounted}>
      <Base.Positioner
        dir={dir}
        lang={lang}
        side={side}
        align={align}
        sideOffset={FLOATING.sideOffset}
        collisionPadding={FLOATING.collisionPadding}
        className={DROPDOWN_POSITIONER}
      >
        <DropdownSurface data-placement={placement} {...rest} />
      </Base.Positioner>
    </Base.Portal>
  )
}

/** R-10.5-1: the menu, which is the scroll container. A part of its own, mounted with the portal, so
 * its element exists when it is measured. While it scrolls it is a tab stop, so a menu no row of
 * which holds the focus (one a press opened) can still be reached and scrolled. */
function DropdownSurface({ ref, className, ...rest }: DropdownPopupProps) {
  const popup = useDropdownPopup(ref)
  return (
    <Base.Popup
      tabIndex={popup.tabIndex}
      {...rest}
      data-dropdown={popup.scope}
      ref={popup.ref}
      className={cn(DROPDOWN_POPUP, className)}
    />
  )
}

/** One row: the icon, the label in the span that truncates it, then the shortcut. */
export function DropdownItem({ icon, shortcut, tone = DROPDOWN_DEFAULTS.tone, className, children, ...rest }: DropdownItemProps) {
  return (
    <Base.Item {...rest} data-tone={tone} className={cn(DROPDOWN_ITEM, DROPDOWN_ITEM_TONE[tone], className)}>
      {renderRow(icon, children, shortcut)}
    </Base.Item>
  )
}

/** The same row as a real anchor, so open-in-new-tab and middle-click work. It closes the
 * menu on a press, which Base UI leaves open: a client-side navigation keeps the page. */
export function DropdownLinkItem({ icon, shortcut, tone = DROPDOWN_DEFAULTS.tone, className, children, ...rest }: DropdownLinkItemProps) {
  return (
    <Base.LinkItem closeOnClick {...rest} data-tone={tone} className={cn(DROPDOWN_ITEM, DROPDOWN_ITEM_TONE[tone], className)}>
      {renderRow(icon, children, shortcut)}
    </Base.LinkItem>
  )
}

/** Base UI's group, named by the DropdownGroupLabel inside it. */
export function DropdownGroup({ className, ...rest }: DropdownGroupProps) {
  return <Base.Group {...rest} className={cn(DROPDOWN_GROUP, className)} />
}

/** A line between two sets of rows, which a screen reader announces as a separator. */
export function DropdownSeparator({ className, ...rest }: DropdownSeparatorProps) {
  return <Base.Separator {...rest} className={cn(DROPDOWN_SEPARATOR, className)} />
}

/** The same menu from data: one group named by title. An href row is a link, cloned from link
 * when one is passed; any other row runs its onSelect or its Server Action on a press. A
 * disabled href row is a plain row, since Base UI gives a link item no disabled. */
export function DropdownMenu({ trigger, title, items, link, placement, className, open, defaultOpen, onOpenChange }: DropdownMenuProps) {
  const menu = useDropdownMenu()
  return (
    <DropdownRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DropdownTrigger render={trigger} />
      <DropdownPopup placement={placement} className={className}>
        <DropdownGroup>
          <DropdownGroupLabel>{title}</DropdownGroupLabel>
          {items.map((item) => (
            <Fragment key={item.id}>
              {item.separatorBefore === true ? <DropdownSeparator /> : null}
              {item.href !== undefined && item.disabled !== true ? (
                <DropdownLinkItem {...toRowProps(item)} render={toLinkElement(link, item.href)}>{item.label}</DropdownLinkItem>
              ) : (
                <DropdownItem {...toRowProps(item)} disabled={item.disabled} onClick={() => { menu.run(item) }}>{item.label}</DropdownItem>
              )}
            </Fragment>
          ))}
        </DropdownGroup>
      </DropdownPopup>
    </DropdownRoot>
  )
}
