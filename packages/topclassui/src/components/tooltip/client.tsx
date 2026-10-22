'use client'

import { Tooltip as Base } from '@base-ui/react/tooltip'

import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { FLOATING, toSideAlign } from '#shared/floating.js'
import { renderTrigger } from '#shared/render-trigger.js'
import { TOOLTIP_BOUNDARIES } from './boundaries.js'
import { TOOLTIP_ARROW, TOOLTIP_POPUP, TOOLTIP_POSITIONER } from './classes.js'
import { TOOLTIP_ARROW_HEIGHT, TOOLTIP_COLLISION_AVOIDANCE, TOOLTIP_DEFAULTS } from './constants.js'
import { useTooltipPopup, useTooltipRoot, useTooltipTriggerElement } from './hook.js'
import type { TooltipPopupProps, TooltipRootProps, TooltipTriggerElementProps, TooltipTriggerProps } from './types.js'

const { delayMin, delayMax } = TOOLTIP_BOUNDARIES

/** Groups one trigger with its popup. It renders no element, so it takes no className,
 * style or ref, and Base UI holds the open state. */
export function TooltipRoot<Payload>(props: TooltipRootProps<Payload>) {
  const { value, Context } = useTooltipRoot()
  return (
    <Context value={value}>
      <Base.Root {...props} />
    </Context>
  )
}

function TooltipTriggerElement(props: TooltipTriggerElementProps) {
  return useTooltipTriggerElement(props)
}

/** Base UI's trigger, styled by nothing of its own: pass the control as render. A delay
 * left out reaches Base UI as undefined, so its 600 or a provider's delay still applies. */
export function TooltipTrigger<Payload>({
  delay,
  closeDelay,
  className,
  render,
  ...rest
}: TooltipTriggerProps<Payload>) {
  const trigger = renderTrigger(render, className)
  return (
    <Base.Trigger
      {...rest}
      // R-5.6-1: Base UI 1.8.0 links no description, so the element names the open popup itself.
      render={(props, state) => <TooltipTriggerElement render={trigger.render} props={props} state={state} />}
      delay={delay === undefined ? undefined : clamp(delay, delayMin, delayMax)}
      closeDelay={closeDelay === undefined ? undefined : clamp(closeDelay, delayMin, delayMax)}
      className={trigger.className}
    />
  )
}

/** The portal, positioner, popup and arrow in one part. Rest props reach the popup, container and
 * keepMounted the portal; the positioner takes none, so the placement and the collision rule stay ours. */
export function TooltipPopup({
  placement = TOOLTIP_DEFAULTS.placement,
  container,
  keepMounted,
  className,
  children,
  ...rest
}: TooltipPopupProps) {
  const { side, align } = toSideAlign(placement)
  const { dir, lang, id } = useTooltipPopup(rest.id)
  return (
    <Base.Portal container={container} keepMounted={keepMounted}>
      <Base.Positioner
        dir={dir}
        lang={lang}
        side={side}
        align={align}
        sideOffset={FLOATING.sideOffset + TOOLTIP_ARROW_HEIGHT}
        collisionPadding={FLOATING.collisionPadding}
        collisionAvoidance={TOOLTIP_COLLISION_AVOIDANCE}
        className={TOOLTIP_POSITIONER}
      >
        <Base.Popup data-placement={placement} {...rest} id={id} role="tooltip" className={cn(TOOLTIP_POPUP, className)}>
          {children}
          <Base.Arrow className={TOOLTIP_ARROW} />
        </Base.Popup>
      </Base.Positioner>
    </Base.Portal>
  )
}
