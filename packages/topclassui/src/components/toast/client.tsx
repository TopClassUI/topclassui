'use client'

import { Toast as Base } from '@base-ui/react/toast'

import { x } from '#icons/data/x.js'
import { cn } from '#shared/cn.js'
import { buttonVariants } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import {
  TOAST_ACTION, TOAST_CLOSE, TOAST_CONTENT, TOAST_DESCRIPTION, TOAST_ICON, TOAST_ICON_SVG, TOAST_ICON_TONE,
  TOAST_PLACEMENT, TOAST_ROOT, TOAST_STAGE, TOAST_STAGE_VIEWPORT, TOAST_TITLE, TOAST_VIEWPORT,
} from './classes.js'
import { TOAST_ICONS } from './constants.js'
import { useToastStage, useToastStageList, useToastViewport } from './hook.js'
import { iconTypeOf } from './lib.js'
import type { ToastItemProps, ToastStageProps, ToastViewportProps } from './types.js'

/** One toast. A Root for every entry, an ending one too: Base UI drops an entry only when its Root has faded out. */
function ToastItem({ entry, swipeDirection, closeLabel }: ToastItemProps) {
  const icon = iconTypeOf(entry.type)
  // WCAG 4.1.2: Base UI hides an unfocused high toast from a reader, yet it keeps its tab stop, action and x.
  return (
    <Base.Root toast={entry} swipeDirection={swipeDirection} aria-hidden={entry.priority === 'high' ? false : undefined} className={TOAST_ROOT}>
      {icon === null ? null : (
        <span className={cn(TOAST_ICON, TOAST_ICON_TONE[icon])}>
          <Svg icon={TOAST_ICONS[icon]} className={TOAST_ICON_SVG[icon]} />
        </span>
      )}
      <Base.Content className={TOAST_CONTENT}>
        <Base.Title className={TOAST_TITLE} />
        <Base.Description className={TOAST_DESCRIPTION} />
      </Base.Content>
      <Base.Action className={cn(buttonVariants({ variant: 'outline', tone: 'neutral', size: 'sm' }), TOAST_ACTION)} />
      {/* WCAG 2.5.7: a swipe is a drag, so the x is always there. Base UI hides it from a reader until the stack expands. */}
      <Base.Close aria-label={closeLabel} aria-hidden={false} className={TOAST_CLOSE}>
        <Svg icon={x} size="0.875em" />
      </Base.Close>
    </Base.Root>
  )
}

/** The one live region of the app. TopClassProvider mounts it: do not mount a second. Its place, its
 * labels, its dir and its lang are the outermost provider's, so an island's toast shows in the page's corner. */
export function ToastViewport({ className, ref, ...rest }: ToastViewportProps) {
  const viewport = useToastViewport(ref)
  if (!viewport.draws) return null
  return (
    <Base.Portal>
      <Base.Viewport
        {...rest}
        ref={viewport.ref}
        dir={viewport.dir}
        lang={viewport.lang}
        aria-label={viewport.labels.region}
        onFocus={viewport.onFocus}
        onBlur={viewport.onBlur}
        className={cn(TOAST_VIEWPORT, TOAST_PLACEMENT[viewport.placement], className)}
      >
        {viewport.toasts.map((entry) => (
          <ToastItem key={entry.id} entry={entry} swipeDirection={viewport.swipeDirection} closeLabel={viewport.labels.close} />
        ))}
      </Base.Viewport>
    </Base.Portal>
  )
}

/** The column of a stage: its own toasts, drawn in the box with no portal. */
function ToastStageViewport() {
  const stage = useToastStageList()
  return (
    <Base.Viewport aria-label={stage.labels.region} className={TOAST_STAGE_VIEWPORT}>
      {stage.toasts.map((entry) => (
        <ToastItem key={entry.id} entry={entry} swipeDirection={stage.swipeDirection} closeLabel={stage.labels.close} />
      ))}
    </Base.Viewport>
  )
}

/** A box that shows a toast at rest in its bottom-end corner, for a docs stage or a screenshot: a list of its own,
 * so `toast.add` still reaches the page's corner. The children are what the box holds. */
export function ToastStage({ toast: shown, className, children, ...rest }: ToastStageProps) {
  const manager = useToastStage(shown)
  return (
    <Base.Provider toastManager={manager}>
      <div {...rest} className={cn(TOAST_STAGE, className)}>
        {children}
        <ToastStageViewport />
      </div>
    </Base.Provider>
  )
}
