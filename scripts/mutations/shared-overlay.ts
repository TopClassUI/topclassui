// The mutations of what was lifted out of the first overlay for the next ones: the Escape guard, the content
// test, the action wrap and the passive pair. Found by scripts/mutations/index.ts; every label says "lifted".
import type { Mutation } from '../lib/mutate.js'

const OVERLAY = 'src/shared/overlay.ts'
const TRIGGER = 'src/shared/render-trigger.ts'
const CLASSES = 'src/shared/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the lifted Escape guard cancels the close but lets Base UI stop the key, so the tooltip inside an overlay never hears it and stays open',
    file: OVERLAY,
    from: "      // Base UI stops the key at the popup; the tooltip listens on the document, further up.\n      details.allowPropagation()\n",
    to: '',
  },
  {
    label: 'the lifted Escape guard cancels every Escape, whether or not a popup is open inside, so the key never closes an overlay',
    file: OVERLAY,
    from: ' && holdsOpenPopup(details.event.target, popups)) {',
    to: ') {',
  },
  {
    label: 'the lifted Escape guard also cancels a press outside while a tooltip is open, so the scrim stops closing its overlay',
    file: OVERLAY,
    from: "if (!open && details.reason === 'escape-key' && holdsOpenPopup(",
    to: 'if (!open && holdsOpenPopup(',
  },
  {
    label: 'the lifted Escape guard holds back a change that opens, where only a close may be cancelled',
    file: OVERLAY,
    from: "if (!open && details.reason === 'escape-key'",
    to: "if (details.reason === 'escape-key'",
  },
  {
    label: 'the lifted Escape guard ignores the selector it is given, so the guard of a menu looks for a popup it is never inside',
    file: OVERLAY,
    from: 'from.closest(popups)',
    to: `from.closest('[role="dialog"], [role="alertdialog"]')`,
  },
  {
    label: 'the lifted Escape guard forgets the alert role by default, so a confirm closes together with the tooltip inside it',
    file: OVERLAY,
    from: `popups = '[role="dialog"], [role="alertdialog"]',`,
    to: `popups = '[role="dialog"]',`,
  },
  {
    label: 'the lifted escape scope is dropped from the root guard, so an overlay nested in a dialog swallows Escape once focus is back on its trigger',
    file: 'src/shared/overlay-scope.ts',
    from: 'guardEscape(onOpenChange, toScopeSelector(scope))',
    to: 'guardEscape(onOpenChange)',
  },
  {
    label: 'the lifted escape scope selector matches every scoped popup, so the inner overlay finds the outer dialog and swallows the key',
    file: OVERLAY,
    from: 'return `[data-overlay="${scope}"]`',
    to: 'return `[data-overlay]`',
  },
  {
    label: 'the lifted content test counts a boolean as content, so a close around {saving && label} is an empty control while saving is false',
    file: TRIGGER,
    from: " && typeof children !== 'boolean' && children !== ''",
    to: " && children !== ''",
  },
  {
    label: 'the lifted content test counts an empty string as content, so a close around a label not yet loaded is an empty control',
    file: TRIGGER,
    from: " && typeof children !== 'boolean' && children !== ''",
    to: " && typeof children !== 'boolean'",
  },
  {
    label: 'the lifted content test reads a list as content whatever it holds, so a close around two blank children is an empty control',
    file: TRIGGER,
    from: '  if (Array.isArray(children)) return children.some(hasContent)\n',
    to: '',
  },
  {
    label: 'the lifted action wrap stops lifting nowrap from the actions, so a long action ends in an ellipsis on a phone',
    file: CLASSES,
    from: "'**:whitespace-normal *:[&:is(button,a)]:data-size:text-center',",
    to: "'*:[&:is(button,a)]:data-size:text-center',",
  },
  {
    label: 'the lifted action wrap lets a label wrap but keeps each action at the height of its size, so the second line spills out of it',
    file: CLASSES,
    from: "'*:[&:is(button,a)]:data-size:not-data-[size=custom]:h-auto *:[&:is(button,a)]:data-size:not-data-[size=custom]:py-1',",
    to: "'*:[&:is(button,a)]:data-size:not-data-[size=custom]:py-1',",
  },
  {
    label: 'the lifted action wrap drops the 44 px floor of a medium action under a finger, so it is 40 px tall on a phone',
    file: CLASSES,
    from: "  'pointer-coarse:*:[&:is(button,a)]:data-[size=md]:min-h-[var(--tc-target-coarse,44px)]',\n",
    to: '',
  },
  {
    label: 'the lifted action wrap gives a medium action the floor of a small one, so it is 32 px tall where it was 40',
    file: CLASSES,
    from: '*:[&:is(button,a)]:data-[size=md]:min-h-control-md',
    to: '*:[&:is(button,a)]:data-[size=md]:min-h-control-sm',
  },
  {
    label: 'the lifted action wrap floors every sized child, so a Badge or a Progress in a footer is 40 px tall',
    file: CLASSES,
    from: "'*:[&:is(button,a)]:data-[size=md]:min-h-control-md",
    to: "'*:data-[size=md]:min-h-control-md",
  },
  {
    label: 'the lifted passive viewport still catches every press, so nothing on the page behind an overlay that is not modal can be pressed',
    file: CLASSES,
    from: "export const VIEWPORT_PASSIVE = 'pointer-events-none'",
    to: "export const VIEWPORT_PASSIVE = 'pointer-events-auto'",
  },
  {
    label: 'the lifted passive popup never takes its presses back from its viewport, so its own controls are dead',
    file: CLASSES,
    from: "export const POPUP_PASSIVE = 'pointer-events-auto'",
    to: "export const POPUP_PASSIVE = ''",
  },
]
