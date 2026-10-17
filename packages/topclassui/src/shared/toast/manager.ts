import type { ToastManager, ToastManagerEvent } from '@base-ui/react/toast'

type Listener = (event: ToastManagerEvent) => void

const listeners = new Set<Listener>()
/** The calls made while no provider listens. Base UI's provider subscribes in an effect, after its children's
 * effects, so a page's toast on mount comes too early: the first provider to subscribe gets these in order. */
const pending: ToastManagerEvent[] = []
let count = 0

function emit(event: ToastManagerEvent): void {
  if (listeners.size > 0) for (const listener of listeners) listener(event)
  // On the server no provider ever subscribes, so a kept call would only pile up there.
  else if (typeof document !== 'undefined') pending.push(event)
}

/** The one manager of the app, Base UI's createToastManager with a queue. TopClassProvider hands it to
 * Toast.Provider, so `add()` from any function in the browser reaches the toasts. No client directive. */
export const toastManager: ToastManager = {
  ' subscribe'(listener) {
    listeners.add(listener)
    for (const event of pending.splice(0)) listener(event)
    return () => { listeners.delete(listener) }
  },
  add(options) {
    const id = options.id === undefined || options.id === '' ? `toast-${String(++count)}` : options.id
    emit({ action: 'add', options: { ...options, id, transitionStatus: 'starting' } })
    return id
  },
  close(id) {
    emit({ action: 'close', options: { id } })
  },
  update(id, updates) {
    emit({ action: 'update', options: { id, updates } })
  },
  promise(promiseValue, options) {
    let handed = promiseValue
    let returned = false
    // A queued promise is handled after this returns: its copy reaches no caller, who holds the original.
    const setPromise = (handled: typeof promiseValue) => {
      if (returned) handled.catch(() => undefined)
      else handed = handled
    }
    emit({ action: 'promise', options: { ...options, promise: promiseValue, setPromise } })
    returned = true
    return handed
  },
}
