// HTML "The label element": a click on an interactive descendant of a label does nothing; happy-dom loops on it.
import { afterAll, beforeAll } from 'vitest'

const INTERACTIVE = 'a[href], button, input, select, textarea'

/** Gives happy-dom Chromium's label rule for the tests of one file, so the radio input Base UI clicks inside our label
 * does not send the click back to the radio until the stack overflows. */
export function useChromiumLabels(): void {
  const prototype = HTMLLabelElement.prototype
  const control = Object.getOwnPropertyDescriptor(prototype, 'control')
  const dispatch = Object.getOwnPropertyDescriptor(prototype, 'dispatchEvent')
  const send = dispatch?.value as ((this: HTMLLabelElement, event: Event) => boolean) | undefined
  let target: EventTarget | null = null

  beforeAll(() => {
    Object.defineProperty(prototype, 'dispatchEvent', {
      configurable: true,
      writable: true,
      value(this: HTMLLabelElement, event: Event): boolean {
        const outer = target
        target = event.target
        try { return send?.call(this, event) ?? false } finally { target = outer }
      },
    })
    Object.defineProperty(prototype, 'control', {
      configurable: true,
      get(this: HTMLLabelElement) {
        const own = control?.get?.call(this) as HTMLElement | null
        const inner = target instanceof Element && target !== own && this.contains(target) && target.matches(INTERACTIVE)
        return inner ? null : own
      },
    })
  })

  afterAll(() => {
    if (dispatch) Object.defineProperty(prototype, 'dispatchEvent', dispatch)
    if (control) Object.defineProperty(prototype, 'control', control)
  })
}
