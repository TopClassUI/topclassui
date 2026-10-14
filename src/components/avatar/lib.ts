// R-5.12-1: the pure helper AvatarImage reads its source with. No React here.

/** The source a failure is kept against: the src given, or the one written on the render element. */
export function readSource(src: unknown, render: { props: unknown } | undefined): unknown {
  if (src !== undefined || render === undefined) return src
  const own = render.props
  return typeof own === 'object' && own !== null && 'src' in own ? own.src : undefined
}
