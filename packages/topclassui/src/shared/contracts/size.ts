// R-8.3-2: values only, so a component importing resolveIconSize never pulls zod into the bundle.

/** R-5.7-2: one scale on every component with a visual size. `custom` emits no size classes. */
export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', 'custom'] as const
export type Size = (typeof SIZES)[number]

export const DEFAULT_SIZE = 'md' satisfies Size

/** The same five names against pixel values, for the one component measured in pixels. */
export const ICON_SIZE = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 } as const
export type IconSize = keyof typeof ICON_SIZE

/**
 * `<Icon>` is the only component whose default is `1em` rather than `md`, so an icon
 * with no size matches the text beside it. Any CSS length is passed through untouched.
 */
export function resolveIconSize(size: IconSize | number | (string & {})): number | string {
  return typeof size === 'string' && size in ICON_SIZE ? ICON_SIZE[size as IconSize] : size
}
