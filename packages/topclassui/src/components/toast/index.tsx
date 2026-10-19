// R-5.1-2: re-exports only: the viewport TopClassProvider mounts, the calls that fill it, and a stage that shows one in place.
export { ToastStage, ToastViewport } from './client.js'
export { toast } from '#shared/toast/toast.js'
export type {
  ToastAction, ToastDesignProps, ToastOptions, ToastPlacement, ToastPromiseSteps, ToastStep, ToastTitle, ToastTone, ToastUpdate,
  ToastStageProps, ToastStageToast, ToastViewportProps,
} from './types.js'
