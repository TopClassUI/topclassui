// The mutations of src/components/toast, of the viewport TopClassProvider mounts, and of the harness's toast parameter.
// Found by scripts/mutations/index.ts. Every label holds "toast", the word to filter them by.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'toast.add stops clamping duration, so a duration of 9000000000 keeps a toast for 104 days',
    file: 'src/components/toast/lib.ts',
    from: 'return Number.isNaN(duration) ? undefined : clamp(duration, TOAST_BOUNDARIES.durationMin, TOAST_BOUNDARIES.durationMax)',
    to: 'return Number.isNaN(duration) ? undefined : duration',
  },
  {
    label: 'toast.add sends a duration that is no number as given, so a NaN reaches the timer of Base UI',
    file: 'src/components/toast/lib.ts',
    from: 'return Number.isNaN(duration) ? undefined :',
    to: 'return Number.isNaN(duration) ? duration :',
  },
  {
    label: 'toast.add forgets the default tone, so a toast left untoned has no type at all',
    file: 'src/components/toast/lib.ts',
    from: 'type: options.tone ?? TOAST_DEFAULTS.tone',
    to: 'type: options.tone',
  },
  {
    label: 'toast.update writes every key, so updating the title wipes the description of the toast',
    file: 'src/components/toast/lib.ts',
    from: '  if (options.description !== undefined) out.description = options.description\n',
    to: '  out.description = options.description\n',
  },
  {
    label: 'the toast swipe ignores the direction, so a toast at the bottom left in Arabic swipes to the right',
    file: 'src/components/toast/lib.ts',
    from: "const atRight = (inline === 'end') === (direction === 'ltr')",
    to: "const atRight = inline === 'end'",
  },
  {
    label: 'a centered toast swipes sideways too, toward the right',
    file: 'src/components/toast/lib.ts',
    from: '  if (inline === undefined) return [vertical]\n',
    to: "  if (inline === undefined) return [vertical, 'right']\n",
  },
  {
    label: 'the toast viewport renders no Root for an ending toast, so a closed one never leaves the list of Base UI',
    file: 'src/components/toast/client.tsx',
    from: '{viewport.toasts.map((entry) => (',
    to: "{viewport.toasts.filter((entry) => entry.transitionStatus !== 'ending').map((entry) => (",
  },
  {
    label: 'the x of a toast renders only beside an action, so a bare toast can be closed by a swipe alone',
    file: 'src/components/toast/client.tsx',
    from: '      <Base.Close aria-label={closeLabel} aria-hidden={false} className={TOAST_CLOSE}>\n        <Svg icon={x} />\n      </Base.Close>\n',
    to: '      {entry.actionProps === undefined ? null : (\n        <Base.Close aria-label={closeLabel} aria-hidden={false} className={TOAST_CLOSE}>\n          <Svg icon={x} />\n        </Base.Close>\n      )}\n',
  },
  {
    label: 'the x of a toast is hidden from a reader again, as Base UI hides it until the stack expands',
    file: 'src/components/toast/client.tsx',
    from: ' aria-hidden={false}',
    to: '',
  },
  {
    label: 'toast.add takes a toast with no title again, a dialog with no name (TOAST-6)',
    file: 'src/components/toast/types.ts',
    from: '  title: ToastTitle\n',
    to: '  title?: ReactNode\n',
  },
  {
    label: 'the toast viewport loses the direction of its provider, so an Arabic page lays its toasts out left to right',
    file: 'src/components/toast/client.tsx',
    from: '        dir={viewport.dir}\n',
    to: '',
  },
  {
    label: 'the toast viewport loses its label, so an Arabic page announces English Notifications',
    file: 'src/components/toast/client.tsx',
    from: '        aria-label={viewport.labels.region}\n',
    to: '',
  },
  {
    label: 'the toast viewport catches every press in its box, so a button of the page under it can no longer be pressed',
    file: 'src/components/toast/classes.ts',
    from: ' ${FOCUS_RING_INSET} ${VIEWPORT_PASSIVE}`',
    to: ' ${FOCUS_RING_INSET}`',
  },
  {
    label: 'a toast inside the passive viewport takes no press back, so its x cannot be pressed',
    file: 'src/components/toast/classes.ts',
    from: '${FOCUS_RING} ${POPUP_PASSIVE}`',
    to: '${FOCUS_RING}`',
  },
  {
    label: 'a toast rests on the translate property, so a held toast moves twice as far as the finger',
    file: 'src/components/toast/classes.ts',
    from: "const FOLLOW = 'transform-[translate(var(--toast-swipe-movement-x,0px),var(--toast-swipe-movement-y,0px))]",
    to: "const FOLLOW = 'translate-x-[var(--toast-swipe-movement-x,0px)] translate-y-[var(--toast-swipe-movement-y,0px)]",
  },
  {
    label: 'the bottom toast viewport loses the safe area, so a toast sits under the home indicator of a phone',
    file: 'src/components/toast/classes.ts',
    from: "const BOTTOM = 'bottom-0 flex-col-reverse pb-[calc(var(--tc-overlay-inset)+var(--tc-safe-bottom))]'",
    to: "const BOTTOM = 'bottom-0 flex-col-reverse pb-(--tc-overlay-inset)'",
  },
  {
    label: 'the top toast viewport loses the safe area, so a toast sits under the notch of a phone',
    file: 'src/components/toast/classes.ts',
    from: "const TOP = 'top-0 flex-col pt-[calc(var(--tc-overlay-inset)+var(--tc-safe-top))]'",
    to: "const TOP = 'top-0 flex-col pt-(--tc-overlay-inset)'",
  },
  {
    label: 'the bottom toast column runs toward the edge, so the newest toast is the farthest from it',
    file: 'src/components/toast/classes.ts',
    from: "const BOTTOM = 'bottom-0 flex-col-reverse ",
    to: "const BOTTOM = 'bottom-0 flex-col ",
  },
  {
    label: 'a toast past the limit is drawn, so twenty toasts cover the screen',
    file: 'src/components/toast/classes.ts',
    from: ' wrap-anywhere data-limited:hidden',
    to: ' wrap-anywhere',
  },
  {
    label: 'the toast spinner turns for a reader who asked for less motion',
    file: 'src/components/toast/classes.ts',
    from: "  loading: 'animate-spin motion-reduce:animate-none',",
    to: "  loading: 'animate-spin',",
  },
  {
    label: 'a long toast action label stays on one line and runs out of its button',
    file: 'src/components/toast/classes.ts',
    from: 'h-auto min-h-control-sm whitespace-normal py-1',
    to: 'h-auto min-h-control-sm py-1',
  },
  {
    label: 'every toast viewport draws, so a page of two React roots has two live regions and shows each toast twice',
    file: 'src/components/toast/client.tsx',
    from: '  if (!viewport.draws) return null\n',
    to: '',
  },
  {
    label: 'the provider mounts no toast viewport, so toast.add() in an app with only TopClassProvider shows nothing',
    file: 'src/shared/provider/provider.tsx',
    from: '                <ToastViewport />\n',
    to: '',
  },
  {
    label: 'a nested provider mounts a toast viewport of its own, so an RTL island gives the page two live regions',
    file: 'src/shared/provider/provider.tsx',
    from: '{nested ? isolated : (',
    to: '{nested ? <>{isolated}<ToastViewport /></> : (',
  },
  {
    label: 'a live harness page drops its toast placement on the way to the browser, so a toast spec measures the default corner',
    file: 'scripts/lib/live-harness.ts',
    from: "const toast = route.toast === undefined ? '' : `, ${inScript(route.toast)}`",
    to: "const toast = ''",
  },
  {
    label: 'a live harness page takes any word for a toast placement',
    file: 'scripts/lib/live-harness.ts',
    from: "if (toast !== null && !oneOf(TOAST_PLACEMENTS, toast)) {",
    to: 'if (toast === "never") {',
  },
]
