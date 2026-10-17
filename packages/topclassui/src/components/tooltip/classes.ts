// R-5.12-4: one class string per element Tooltip styles; the trigger's look is its render element's.

/** Wraps at the max width, and a long file name breaks instead of leaving the chip. */
export const TOOLTIP_POPUP =
  'max-w-xs wrap-anywhere rounded-control bg-neutral-solid px-3 py-1 text-xs text-neutral-on-solid'

/** Above the page, and hidden once its trigger scrolls out of view (PLAN 10.5). */
export const TOOLTIP_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'

/** A rotated square. Base UI sets only its cross-axis offset, so the edge it sits on is
 * keyed here on the side Base UI writes; no left or right, so no fallback to them. */
export const TOOLTIP_ARROW = [
  'size-2 rotate-45 bg-neutral-solid',
  'data-[side=top]:-bottom-1',
  'data-[side=bottom]:-top-1',
  'data-[side=inline-start]:-inset-e-1',
  'data-[side=inline-end]:-inset-s-1',
].join(' ')
