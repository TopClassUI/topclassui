import type { BaseUIEvent } from '@base-ui/react/types'
import type { MouseEvent } from 'react'

/** A mouse move on a row of a Base UI list, as Base UI types the handler. */
export type RowMouseMove = (event: BaseUIEvent<MouseEvent<HTMLDivElement>>) => void

/** Base UI moves the highlight to the row under the pointer, a disabled row too, and a menu or a select moves the focus
 * with it. A disabled row keeps its pointer events for its not-allowed cursor, so its own move skips Base UI's. */
export function skipDisabledHighlight(disabled: boolean | undefined, own?: RowMouseMove): RowMouseMove {
  return (event) => {
    own?.(event)
    if (disabled === true) event.preventBaseUIHandler()
  }
}
