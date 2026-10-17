import { cn } from './cn.js'

/** Every design prop a component varies on, as the list of values each one allows. */
export type Allowed = Record<string, readonly unknown[]>

/** The props those lists describe: one value from each. */
export type Chosen<A extends Allowed> = { [K in keyof A]: A[K][number] }

export type VariantInput<A extends Allowed> = Partial<Chosen<A>> & {
  className?: string | undefined
  class?: string | undefined
}

/** The combinations of one allowed map, as the keys a cache may hold. */
function everyKey(allowed: Allowed): Set<string> {
  let keys: string[][] = [[]]
  for (const values of Object.values(allowed)) {
    keys = keys.flatMap((prefix) => values.map((value) => [...prefix, String(value)]))
  }
  return new Set(keys.map((parts) => parts.join('|')))
}

/** cva rescans every compound variant per call: 7.43us against 0.52us cached. Only the
 * real combinations are cached, or a free string would grow the map without bound. */
export function memoizeVariants<A extends Allowed>(
  resolve: (props: Chosen<A>) => string,
  allowed: A,
  defaults: Chosen<A>,
): (props?: VariantInput<A>) => string {
  const names = Object.keys(allowed) as (keyof A)[]
  const cacheable = everyKey(allowed)
  const cache = new Map<string, string>()

  return (props = {}) => {
    const chosen = {} as Chosen<A>
    const parts: string[] = []
    for (const name of names) {
      const value = props[name] ?? defaults[name]
      chosen[name] = value
      parts.push(String(value))
    }

    const key = parts.join('|')
    let classes = cache.get(key)
    if (classes === undefined) {
      classes = cn(resolve(chosen))
      if (cacheable.has(key)) cache.set(key, classes)
    }

    // The cva export appended these, so dropping them would be a silent regression.
    const extra = props.className ?? props.class
    return extra === undefined ? classes : cn(classes, extra)
  }
}
