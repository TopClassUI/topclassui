// One tree for both sides of a live page: Node renders it, the browser hydrates it.
import { type ComponentType, type ReactElement, type ReactNode, useEffect } from 'react'

import type { ToastPlacement } from '#shared/contracts/toast.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import type { Direction } from './harness.js'

interface HydratedProps { onHydrated: (() => void) | undefined; children: ReactNode }

/** An effect runs after its children's, so this one fires once the whole demo has hydrated. */
function Hydrated({ onHydrated, children }: HydratedProps) {
  useEffect(() => { onHydrated?.() }, [onHydrated])
  return children
}

/** The demo inside the provider a root layout would mount (R-13-1), with the page's direction and locale,
 * and the placement of its toasts when the page asks for one. */
export function liveTree(
  Demo: ComponentType,
  direction: Direction,
  locale: string,
  onHydrated?: () => void,
  toast?: ToastPlacement,
): ReactElement {
  return (
    <Hydrated onHydrated={onHydrated}>
      <TopClassProvider direction={direction} locale={locale} toast={toast === undefined ? undefined : { placement: toast }}>
        <Demo />
      </TopClassProvider>
    </Hydrated>
  )
}
