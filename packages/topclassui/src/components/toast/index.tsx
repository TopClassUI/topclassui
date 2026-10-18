// R-5.1-2: re-exports only. Two names: the viewport TopClassProvider mounts, and the calls that fill it.
export { ToastViewport } from './client.js'
export { toast } from '#shared/toast/toast.js'
export type {
  ToastAction, ToastDesignProps, ToastOptions, ToastPlacement, ToastPromiseSteps, ToastStep, ToastTitle, ToastTone, ToastUpdate,
  ToastViewportProps,
} from './types.js'
