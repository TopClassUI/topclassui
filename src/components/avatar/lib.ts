// R-5.12-1: the pure helper AvatarImage reads its source with. No React here.

type Render = { props: unknown } | undefined

/** The source a failure is kept against: the src and srcSet the img renders with. */
export function readSource(own: { src?: unknown, srcSet?: unknown }, render: Render): { src: unknown, srcSet: unknown } {
  return { src: readOne(own.src, render, 'src'), srcSet: readOne(own.srcSet, render, 'srcSet') }
}

/** The render element's own value wins, as it does in renderElement; else the one the part was given. */
function readOne(given: unknown, render: Render, key: 'src' | 'srcSet'): unknown {
  const own = render?.props
  if (typeof own !== 'object' || own === null || !(key in own)) return given
  const value: unknown = (own as Record<string, unknown>)[key]
  return value === undefined ? given : value
}
