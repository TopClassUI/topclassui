import { Toast } from '@base-ui/react/toast'

/** The one manager of the app: TopClassProvider hands it to Toast.Provider, so `add()` from
 * any function in the browser reaches the toasts. No client directive, here or in Base UI's
 * createToastManager: it stays a plain function, never a client reference. */
export const toastManager = Toast.createToastManager()
