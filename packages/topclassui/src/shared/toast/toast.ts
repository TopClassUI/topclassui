// No React here: `toast` runs in any browser module, a click handler or a plain script, inside React or not.
import type { ToastOptions, ToastPromiseSteps, ToastStep, ToastUpdate } from '#components/toast/types.js'
import { clamp } from '../clamp.js'
import { TOAST_BOUNDARIES, TOAST_DEFAULTS } from '../contracts/toast.js'
import { toastManager } from './manager.js'

type BaseAdd = Parameters<typeof toastManager.add>[0]
type BaseUpdate = Exclude<Parameters<typeof toastManager.update>[1], (...args: never[]) => unknown>

/** R-5.7-7: a duration inside TOAST_BOUNDARIES, or undefined for one that is no number, so the provider's applies. */
export function clampDuration(duration: number): number | undefined {
  return Number.isNaN(duration) ? undefined : clamp(duration, TOAST_BOUNDARIES.durationMin, TOAST_BOUNDARIES.durationMax)
}

/** Our names to Base UI's: tone is its type, duration its timeout, action its actionProps. A key left out stays out. */
export function toBaseOptions(options: Omit<ToastUpdate, 'tone'> & { tone?: string | undefined }): BaseUpdate {
  const out: BaseUpdate = {}
  if (options.title !== undefined) out.title = options.title
  if (options.description !== undefined) out.description = options.description
  if (options.tone !== undefined) out.type = options.tone
  if (options.priority !== undefined) out.priority = options.priority
  const timeout = options.duration === undefined ? undefined : clampDuration(options.duration)
  if (timeout !== undefined) out.timeout = timeout
  if (options.action !== undefined) out.actionProps = { children: options.action.label, onClick: options.action.onClick }
  return out
}

/** A step of a promise: a string is its title. */
const toStep = (step: ToastStep): BaseUpdate => toBaseOptions(typeof step === 'string' ? { title: step } : step)

function add(options: ToastOptions): string {
  const given: BaseAdd = toBaseOptions(options)
  return toastManager.add({ ...given, type: options.tone ?? TOAST_DEFAULTS.tone })
}

function update(id: string, options: ToastUpdate): void {
  toastManager.update(id, toBaseOptions(options))
}

/** With no id, every toast closes. */
function close(id?: string): void {
  toastManager.close(id)
}

/** One toast: a spinner while it waits, then the success or the error icon and text in its place. */
function promise<Value>(waiting: Promise<Value>, steps: ToastPromiseSteps<Value>): Promise<Value> {
  return toastManager.promise(waiting, {
    loading: toStep(steps.loading),
    success: (value: Value) => toStep(typeof steps.success === 'function' ? steps.success(value) : steps.success),
    error: (error: unknown) => toStep(typeof steps.error === 'function' ? steps.error(error) : steps.error),
  })
}

/** The four calls over the one manager the provider listens to. A call made before it listens waits for it. */
export const toast = { add, update, close, promise }
