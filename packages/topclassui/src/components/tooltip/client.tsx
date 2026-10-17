'use client'

import { Tooltip as Base } from '@base-ui/react/tooltip'

import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { POPUP_BOUNDS, toSideAlign } from '#shared/floating.js'
import { renderTrigger } from '#shared/render-trigger.js'
import { TOOLTIP_BOUNDARIES } from './boundaries.js'
import { TOOLTIP_ARROW, TOOLTIP_POPUP, TOOLTIP_POSITIONER } from './classes.js'
import { TOOLTIP_ARROW_HEIGHT, TOOLTIP_COLLISION_AVOIDANCE, TOOLTIP_DEFAULTS } from './constants.js'
import { useTooltipPopup } from './hook.js'
import type { TooltipPopupProps, TooltipRootProps, TooltipTriggerProps } from './types.js'

const { delayMin, delayMax } = TOOLTIP_BOUNDARIES

/** Groups one trigger with its popup. It renders no element, so it takes no className,
 * style or ref, and Base UI holds the open state. */
export function TooltipRoot<Payload>(props: TooltipRootProps<Payload>) {
  return <Base.Root {...props} />
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
      render={trigger.render}
      delay={delay === undefined ? undefined : clamp(delay, delayMin, delayMax)}
      closeDelay={closeDelay === undefined ? undefined : clamp(closeDelay, delayMin, delayMax)}
      className={trigger.className}
    />
  )
}

/** The portal, positioner, popup and arrow in one part. Rest props reach the popup;
 * the positioner takes none, so the placement and the collision rule stay ours. */
export function TooltipPopup({
  placement = TOOLTIP_DEFAULTS.placement,
  className,
  children,
  ...rest
}: TooltipPopupProps) {
  const { side, align } = toSideAlign(placement)
  const { dir, lang } = useTooltipPopup()
  return (
    <Base.Portal>
      <Base.Positioner
        dir={dir}
        lang={lang}
        side={side}
        align={align}
        sideOffset={POPUP_BOUNDS.sideOffset + TOOLTIP_ARROW_HEIGHT}
        collisionPadding={POPUP_BOUNDS.collisionPadding}
        collisionAvoidance={TOOLTIP_COLLISION_AVOIDANCE}
        className={TOOLTIP_POSITIONER}
      >
        <Base.Popup data-placement={placement} {...rest} className={cn(TOOLTIP_POPUP, className)}>
          {children}
          <Base.Arrow className={TOOLTIP_ARROW} />
        </Base.Popup>
      </Base.Positioner>
    </Base.Portal>
  )
}
