// The mutations of the toast mechanics inside TopClassProvider: the contract, the manager and the wiring.
// Found by scripts/mutations/index.ts. Every label holds "toast provider", the word to filter them by.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the toast provider loses its manager, so add() from outside React reaches nothing',
    file: 'src/shared/provider/provider.tsx',
    from: '<Toast.Provider toastManager={toastManager} limit',
    to: '<Toast.Provider limit',
  },
  {
    label: 'the toast provider loses its limit, so a limit of 1 on TopClassProvider still shows three',
    file: 'src/shared/provider/provider.tsx',
    from: ' limit={toastSettings.limit}',
    to: '',
  },
  {
    label: 'the toast provider loses its timeout, so a duration on TopClassProvider never reaches a timer',
    file: 'src/shared/provider/provider.tsx',
    from: ' timeout={toastSettings.duration}',
    to: '',
  },
  {
    label: 'the toast provider settings are rebuilt on every render, so each reader re-renders with the layout',
    file: 'src/shared/provider/provider.tsx',
    from: '    [placement, limit, duration],\n',
    to: '    [toast],\n',
  },
  {
    label: 'useToastSettings ignores the toast provider and returns the defaults, whatever the app asked for',
    file: 'src/shared/provider/context.ts',
    from: '  return useContext(ToastSettingsContext)',
    to: '  return resolveToastSettings()',
  },
  {
    label: 'the toast provider limit loses its clamp, so a limit of 99 shows ninety-nine toasts',
    file: 'src/shared/contracts/toast.ts',
    from: 'limit: Math.trunc(bound(given.limit, TOAST_DEFAULTS.limit, limitMin, limitMax)),',
    to: 'limit: given.limit ?? TOAST_DEFAULTS.limit,',
  },
  {
    label: 'the toast provider limit loses its floor, so a limit of 0 hides every toast',
    file: 'src/shared/contracts/toast.ts',
    from: 'bound(given.limit, TOAST_DEFAULTS.limit, limitMin, limitMax)',
    to: 'bound(given.limit, TOAST_DEFAULTS.limit, 0, limitMax)',
  },
  {
    label: 'the toast provider duration loses its clamp, so a duration of 9000000000 keeps a toast for 104 days',
    file: 'src/shared/contracts/toast.ts',
    from: 'duration: bound(given.duration, TOAST_DEFAULTS.duration, durationMin, durationMax),',
    to: 'duration: given.duration ?? TOAST_DEFAULTS.duration,',
  },
  {
    label: 'the toast provider duration loses its floor, so a negative duration reaches Base UI as given',
    file: 'src/shared/contracts/toast.ts',
    from: 'bound(given.duration, TOAST_DEFAULTS.duration, durationMin, durationMax)',
    to: 'bound(given.duration, TOAST_DEFAULTS.duration, Number.NEGATIVE_INFINITY, durationMax)',
  },
  {
    label: 'the toast provider limit keeps its fraction, so 2.9 shows three toasts and reads as 2.9',
    file: 'src/shared/contracts/toast.ts',
    from: 'limit: Math.trunc(bound(',
    to: 'limit: (bound(',
  },
  {
    label: 'a NaN handed to the toast provider takes the minimum, so a NaN duration keeps every toast for ever',
    file: 'src/shared/contracts/toast.ts',
    from: 'clamp(Number.isNaN(value) ? fallback : value, min, max)',
    to: 'clamp(value, min, max)',
  },
  {
    label: 'the toast provider takes any word for a placement, so a physical side reaches the viewport',
    file: 'src/shared/contracts/toast.ts',
    from: 'isPlacement(given.placement) ? given.placement : TOAST_DEFAULTS.placement',
    to: 'given.placement ?? TOAST_DEFAULTS.placement',
  },
  {
    label: 'the toast provider default moves to the start corner, away from where the design draws it',
    file: 'src/shared/contracts/toast.ts',
    from: "  placement: 'bottom-end',\n",
    to: "  placement: 'bottom-start',\n",
  },
  {
    label: 'the toast provider boundary lets a thousand toasts through',
    file: 'src/shared/contracts/toast.ts',
    from: '  limitMax: 10,\n',
    to: '  limitMax: 1000,\n',
  },
  {
    label: 'the schema of the toast provider prop stops at another limit than the one the resolver clamps to',
    file: 'src/shared/contracts/toast.schema.ts',
    from: '.min(limitMin).max(limitMax)',
    to: '.min(limitMin).max(limitMax + 1)',
  },
  {
    label: 'the manager of the toast provider gains a client directive, so a server module gets a reference and no add()',
    file: 'src/shared/toast/manager.ts',
    from: "import type { ToastManager, ToastManagerEvent } from '@base-ui/react/toast'\n",
    to: "'use client'\n\nimport type { ToastManager, ToastManagerEvent } from '@base-ui/react/toast'\n",
  },
  {
    label: 'the toast manager keeps no queue, so a toast a page adds in its mount effect is lost (TOAST-1)',
    file: 'src/shared/toast/manager.ts',
    from: "  else if (typeof document !== 'undefined') pending.push(event)\n",
    to: '',
  },
  {
    label: 'the toast manager queues on the server too, where no provider ever listens and the queue only grows',
    file: 'src/shared/toast/manager.ts',
    from: "  else if (typeof document !== 'undefined') pending.push(event)",
    to: '  else pending.push(event)',
  },
  {
    label: 'the toast manager replays its queue to every listener, so a second provider draws an early toast twice',
    file: 'src/shared/toast/manager.ts',
    from: 'for (const event of pending.splice(0)) listener(event)',
    to: 'for (const event of pending) listener(event)',
  },
  {
    label: 'the toast manager leaves the copy of a queued promise uncaught, so its rejection is reported unhandled',
    file: 'src/shared/toast/manager.ts',
    from: '      if (returned) handled.catch(() => undefined)\n      else handed = handled',
    to: '      handed = handled',
  },
  {
    label: "the toast manager reuses an empty id, so two toasts added with id '' are one",
    file: 'src/shared/toast/manager.ts',
    from: "options.id === undefined || options.id === '' ?",
    to: 'options.id === undefined ?',
  },
]
