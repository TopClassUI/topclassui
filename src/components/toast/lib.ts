// No React here: `toast` runs in any browser module, a click handler or a plain script, inside React or not.
import { clamp } from '#shared/clamp.js'
import type { Direction } from '#shared/provider/context.js'
import { toastManager } from '#shared/toast/manager.js'
import { TOAST_BOUNDARIES } from './boundaries.js'
import { TOAST_DEFAULTS, TOAST_ICONS } from './constants.js'
import type {
  ToastIconType, ToastOptions, ToastPlacement, ToastPromiseSteps, ToastStep, ToastSwipeDirection,
} from './types.js'

type BaseAdd = Parameters<typeof toastManager.add>[0]
type BaseUpdate = Exclude<Parameters<typeof toastManager.update>[1], (...args: never[]) => unknown>

/** R-5.7-7: a duration inside TOAST_BOUNDARIES, or undefined for one that is no number, so the provider's applies. */
export function clampDuration(duration: number): number | undefined {
  return Number.isNaN(duration) ? undefined : clamp(duration, TOAST_BOUNDARIES.durationMin, TOAST_BOUNDARIES.durationMax)
}

/** Our names to Base UI's: tone is its type, duration its timeout, action its actionProps. A key left out stays out. */
export function toBaseOptions(options: Omit<ToastOptions, 'tone'> & { tone?: string | undefined }): BaseUpdate {
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

function add(options: ToastOptions = {}): string {
  const given: BaseAdd = toBaseOptions(options)
  return toastManager.add({ ...given, type: options.tone ?? TOAST_DEFAULTS.tone })
}

function update(id: string, options: ToastOptions): void {
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

/** The four calls over the one manager the provider listens to. A call made before it mounts is lost. */
export const toast = { add, update, close, promise }

/** The icon a Base UI type draws, or null for one that draws none: neutral, primary, or a type of the caller's. */
export function iconTypeOf(type: string | undefined): ToastIconType | null {
  return type !== undefined && Object.hasOwn(TOAST_ICONS, type) ? type as ToastIconType : null
}

/** R-5.3-4: the swipes that close a toast, physical as Base UI's are. Toward its block edge, and toward the
 * inline edge it sits at, which swaps with the direction; a centered toast has no sideways swipe. */
export function toSwipeDirections(placement: ToastPlacement, direction: Direction): ToastSwipeDirection[] {
  const [block, inline] = placement.split('-')
  const vertical: ToastSwipeDirection = block === 'top' ? 'up' : 'down'
  if (inline === undefined) return [vertical]
  const atRight = (inline === 'end') === (direction === 'ltr')
  return [vertical, atRight ? 'right' : 'left']
}

/** The viewports mounted on the page, first come first served. Each root of an app with two React roots
 * mounts a TopClassProvider, and each provider a viewport: only the first draws, so a page has one live region. */
const mounted: symbol[] = []
const listeners = new Set<() => void>()
const notify = () => { for (const listener of listeners) listener() }

/** Registers a viewport and returns the call that removes it, for an effect to return. */
export function claimViewport(key: symbol): () => void {
  mounted.push(key)
  notify()
  return () => {
    const at = mounted.indexOf(key)
    if (at !== -1) mounted.splice(at, 1)
    notify()
  }
}

/** The viewport that draws: the first one mounted, or none yet. */
export const drawingViewport = (): symbol | undefined => mounted[0]

export function subscribeViewports(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
