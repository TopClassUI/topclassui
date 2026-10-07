'use client'

import { type ComponentType, useCallback, useState } from 'react'

import { type AdaptiveMode, useAdaptiveMode } from './use-adaptive-mode.js'

export interface AdaptiveExtras {
  /** 'auto' follows the viewport; the other two pin a half, for a test or a demo. */
  mode?: AdaptiveMode | 'auto' | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
}

/** R-11.2: both halves take the same props. NoInfer stops the contract being
 * inferred, which would promote a mobile-only prop into the public API. */
export function createAdaptive<P extends object>(
  Desktop: ComponentType<NoInfer<P>>,
  Mobile: ComponentType<NoInfer<P>>,
  options: { query?: string | undefined } = {},
) {
  return function Adaptive(props: P & AdaptiveExtras) {
    const { mode = 'auto', onOpenChange, ...rest } = props
    const live = useAdaptiveMode(mode, options.query)

    // Latched while open, so resizing across the breakpoint never swaps an open overlay.
    const [latched, setLatched] = useState<AdaptiveMode | null>(null)
    const resolved = latched ?? live
    const Half = resolved === 'mobile' ? Mobile : Desktop

    const handleOpenChange = useCallback(
      (open: boolean) => {
        setLatched(open ? live : null)
        onOpenChange?.(open)
      },
      [live, onOpenChange],
    )

    return <Half {...(rest as unknown as P)} onOpenChange={handleOpenChange} />
  }
}
