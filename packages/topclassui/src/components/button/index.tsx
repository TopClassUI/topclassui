// No 'use client': a client bundle gets it only when a client file imports it.
import { cloneElement, type ReactElement, type ReactNode } from 'react'

import { spinner } from '#icons/data/spinner.js'
import { cn } from '#shared/cn.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { renderElement } from '#shared/render.js'
import { Svg } from '#components/svg/index.js'
import { BUTTON_BOUNDARIES } from './boundaries.js'
import { BUTTON_DEFAULTS } from './constants.js'
import type { ButtonProps } from './types.js'
import { buttonVariants } from './variants.js'

export function Button({
  variant = BUTTON_DEFAULTS.variant,
  tone = BUTTON_DEFAULTS.tone,
  size = BUTTON_DEFAULTS.size,
  loading = BUTTON_DEFAULTS.loading,
  fullWidth = BUTTON_DEFAULTS.fullWidth,
  type = 'button',
  disabled,
  className,
  children,
  render,
  ...rest
}: ButtonProps) {
  // Composed rather than replaced, so render={<a>Go</a>} keeps its label and the spinner.
  const withSpinner = (label: ReactNode) => (
    <>
      <Svg icon={spinner} className="animate-spin motion-reduce:animate-none" />
      {label}
    </>
  )

  // PLAN 8.4 uses ||, so a caller cannot re-enable a loading button with disabled={false}.
  const inactive = disabled || loading

  // Only a real button has a disabled attribute; anything else needs the ARIA pair.
  const nativeButton = render == null || render.type === 'button'

  /** An anchor navigates under pointer-events: none and a server component cannot
   * cancel it, so the href goes. next/link keeps its own: the prop is required. */
  const deadLink = inactive && render?.type === 'a'
  const element = deadLink
    ? cloneElement(render as ReactElement<{ href?: string }>, { href: undefined })
    : (render ?? <button type={type} />)

  return renderElement(element, {
    // An <a> with no href has no role, so aria-disabled would reach no screen reader.
    role: deadLink ? 'link' : undefined,
    type: nativeButton ? type : undefined,
    // true or no key at all: Flight keeps a false, and it would then outrank the disabled of a part rendered as this button.
    disabled: nativeButton && inactive ? true : undefined,
    'aria-disabled': !nativeButton && inactive ? true : undefined,
    tabIndex: !nativeButton && inactive ? -1 : undefined,
    // R-5.7-6: presence attributes, and aria-busy is what a screen reader announces.
    'aria-busy': loading || undefined,
    'data-loading': loading ? '' : undefined,
    // Not while loading: data-disabled dims, and a loading button keeps full colour.
    'data-disabled': disabled ? '' : undefined,
    'data-variant': variant,
    'data-tone': tone,
    'data-size': size,
    className: cn(buttonVariants({ variant, tone, size, fullWidth }), className),
    children: truncateLabel(children, BUTTON_BOUNDARIES.labelMaxLength),
    ...rest,
  }, loading ? withSpinner : undefined)
}

export { buttonVariants } from './variants.js'
export { ButtonSkeleton } from './skeleton.js'
export type {
  ButtonDesignProps, ButtonProps, ButtonSkeletonProps, ButtonTone, ButtonVariant, ButtonVariantProps,
} from './types.js'
