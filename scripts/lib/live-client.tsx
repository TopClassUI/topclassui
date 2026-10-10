// The only harness file that runs in a browser: Vite serves it to the inline script of a live page.
import type { ComponentType } from 'react'
import { hydrateRoot } from 'react-dom/client'

import type { Direction } from './harness.js'
import { liveTree } from './live-tree.js'

/** What the page's first script leaves on `window`, before any module has loaded. */
export interface HarnessTrap {
  /** The checkout that served the page, so a test can tell its own server from another worktree's. */
  root: string
  errors: string[]
  fail: (kind: string, detail: unknown) => void
  done: () => void
}

declare global {
  interface Window { __harness?: HarnessTrap }
}

/** Hydrates the server's markup with the server's tree, and reports what React had to repair. */
export function hydrateDemo(Demo: ComponentType, direction: Direction, locale: string): void {
  const container = document.getElementById('demo')
  const trap = window.__harness
  if (!container || !trap) throw new Error('harness: the page has no #demo or no error trap to hydrate into')
  hydrateRoot(container, liveTree(Demo, direction, locale, trap.done), {
    onRecoverableError: (error) => { trap.fail('hydration', error) },
  })
}
