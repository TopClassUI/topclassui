'use client'

import { Children, isValidElement, type ReactNode, useSyncExternalStore } from 'react'

const subscribe = () => () => undefined
const stop = { tabIndex: 0 } as const
const none = {}

/** A tab stop for the server HTML alone. Base UI finds the roving tab stop of a list in an effect,
 * so it serves every item with tabindex -1 and the list cannot be reached before the page hydrates.
 * Spread it before the caller's props; once hydrated it is empty and Base UI owns the tab stop. */
export function useServerTabStop(isStop: boolean): { readonly tabIndex?: 0 } {
  // The server snapshot answers the server render and the render that hydrates; a store never changes.
  const served = useSyncExternalStore(subscribe, () => false, () => true)
  return served && isStop ? stop : none
}

interface ItemProps { value?: unknown, disabled?: unknown, children?: ReactNode }

/** The value whose item takes the server tab stop: the one the page opens on, else the first enabled item, as Base UI
 * picks once hydrated. It sees the items under plain elements only; when it sees none, `opensOn` stands. */
export function serveTabStopOn(children: ReactNode, opensOn: string | null, disabled = false): string | null {
  const all: string[] = []
  const enabled: string[] = []
  const walk = (nodes: ReactNode) => {
    Children.forEach(nodes, (node) => {
      if (!isValidElement<ItemProps>(node)) return
      const { value, disabled: off, children: inner } = node.props
      if (typeof value !== 'string') { walk(inner); return }
      all.push(value)
      if (off !== true) enabled.push(value)
    })
  }
  walk(children)
  if (disabled || (opensOn !== null && all.includes(opensOn))) return opensOn
  return enabled[0] ?? opensOn
}
