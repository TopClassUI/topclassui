// The mutations of src/components/popover. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/popover/client.tsx'
const CLASSES = 'src/components/popover/classes.ts'
const HOOK = 'src/components/popover/hook.ts'
const DUMMY = 'src/components/popover/dummy'

/** The ring drawn outside the box, as FOCUS_RING writes it: 4 px of it would lie on the page, 2 px from the trigger. */
const RING_OUTSIDE = 'outline-none focus-visible:outline-solid focus-visible:outline-(length:--tc-ring-width) focus-visible:outline-offset-(length:--tc-ring-offset) focus-visible:outline-ring'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the popover popup loses max-h-(--available-height), so sixty lines run off the bottom of the screen',
    file: CLASSES,
    from: '  POPUP_BOUNDS,\n',
    to: "  'max-w-[round(down,var(--available-width),1px)]',\n",
  },
  {
    label: 'the popover popup loses max-w-(--available-width), so at a doubled text size it is wider than a phone',
    file: CLASSES,
    from: '  POPUP_BOUNDS,\n',
    to: "  'max-h-(--available-height)',\n",
  },
  {
    label: 'the popover popup loses SCROLL_AREA, so a text taller than its box is painted over the page instead of scrolling',
    file: CLASSES,
    from: "  SCROLL_AREA,\n",
    to: '',
  },
  {
    label: 'the popover popup lets its children shrink, so a 32 px action is squeezed to 24 before the popup scrolls',
    file: CLASSES,
    from: "  '*:shrink-0',\n",
    to: '',
  },
  {
    label: 'the popover popup stops breaking a long word, so a 300-character title scrolls it sideways',
    file: CLASSES,
    from: ' text-sm wrap-anywhere',
    to: ' text-sm',
  },
  {
    label: 'the popover popup draws its ring outside its box again, over the 6 px between it and its trigger',
    file: CLASSES,
    from: "  POPUP_MOTION,\n  FOCUS_RING_INSET,\n",
    to: `  POPUP_MOTION,\n  '${RING_OUTSIDE}',\n`,
  },
  {
    label: 'the popover popup is 384 px wide, wider than a small phone leaves it',
    file: CLASSES,
    from: "'flex w-70 ",
    to: "'flex w-96 ",
  },
  {
    label: 'a popover whose trigger scrolls out of view stays painted over the page',
    file: CLASSES,
    from: "'z-(--tc-z-popup) data-anchor-hidden:invisible'",
    to: "'z-(--tc-z-popup)'",
  },
  {
    label: 'the popover positioner leaves the popup layer, so a sticky bar of the page paints over it',
    file: CLASSES,
    from: "'z-(--tc-z-popup) data-anchor-hidden:invisible'",
    to: "'data-anchor-hidden:invisible'",
  },
  {
    label: 'the popover x loses the icon button classes, so it is 16 px wide under a finger and has no ring',
    file: CLASSES,
    from: '`${ICON_BUTTON} text-muted tone-neutral ${HOVER.ghost}`',
    to: '`text-muted tone-neutral ${HOVER.ghost}`',
  },
  {
    label: 'the popover positioner loses the direction of its provider, so start and end open on the wrong side in an RTL island',
    file: CLIENT,
    from: "        dir={dir}\n",
    to: '',
  },
  {
    label: 'the popover positioner loses the language of its provider, so an Arabic popover on an English page is read in an English voice',
    file: CLIENT,
    from: "        lang={lang}\n",
    to: '',
  },
  {
    label: 'the popover positioner is stamped ltr when no provider is mounted, so on an RTL page with none it is laid out left to right',
    file: CLIENT,
    from: "        dir={dir}\n",
    to: "        dir={dir ?? 'ltr'}\n",
  },
  {
    label: 'the popover positioner hook reads the direction of its provider and forgets the language',
    file: HOOK,
    from: 'export function usePopoverPositioner() {\n  return usePortalLocale()\n}',
    to: 'export function usePopoverPositioner() {\n  return { dir: usePortalLocale().dir, lang: undefined }\n}',
  },
  {
    label: 'PopoverPopup stops passing its placement on, so every popover opens at the shared bottom-start',
    file: CLIENT,
    from: 'const { side, align } = toSideAlign(placement)',
    to: 'const { side, align } = toSideAlign()',
  },
  {
    label: 'the popover drops the alignment half of its placement, so bottom-start opens centred',
    file: CLIENT,
    from: "        align={align}\n",
    to: '',
  },
  {
    label: 'the popover forgets the shared side offset, so the popup touches its trigger',
    file: CLIENT,
    from: "        sideOffset={FLOATING.sideOffset}\n",
    to: '',
  },
  {
    label: "the popover falls back to Base UI's 5 px collision padding instead of the shared 8",
    file: CLIENT,
    from: "        collisionPadding={FLOATING.collisionPadding}\n",
    to: '',
  },
  {
    label: "the popover default placement falls back to the menus' bottom-start instead of bottom",
    file: 'src/components/popover/constants.ts',
    from: "  placement: 'bottom',",
    to: "  placement: 'bottom-start',",
  },
  {
    label: 'the popover root guards Escape by any dialog, so a popover whose trigger sits in a dialog can no longer be closed by the key',
    file: CLIENT,
    from: 'onOpenChange={guardEscape(onOpenChange, popups)}',
    to: 'onOpenChange={guardEscape(onOpenChange)}',
  },
  {
    label: 'the popover root drops its Escape guard, so one key closes a tooltip opened by hover and the popover under it',
    file: CLIENT,
    from: 'onOpenChange={guardEscape(onOpenChange, popups)}',
    to: 'onOpenChange={onOpenChange}',
  },
  {
    label: 'the popover root never shares its scope with its popup, so the guard finds no popup of its own and never waits for a tooltip',
    file: CLIENT,
    from: '<Context value={scope}>',
    to: '<Context value="">',
  },
  {
    label: 'the popover popup writes its scope under another attribute than the one its guard looks for',
    file: 'src/components/popover/lib.ts',
    from: 'return `[data-popover="${scope}"]`',
    to: 'return `[data-popup="${scope}"]`',
  },
  {
    label: 'the scope of the popover popup is written before the rest props, so a data-popover of the caller breaks its Escape guard',
    file: CLIENT,
    from: "      {...rest}\n      data-popover={popup.scope}\n",
    to: "      data-popover={popup.scope}\n      {...rest}\n",
  },
  {
    label: 'the popover root forwards only its children, so open, defaultOpen and modal never reach Base UI',
    file: CLIENT,
    from: '<Base.Root {...props} onOpenChange={guardEscape(onOpenChange, popups)} />',
    to: '<Base.Root onOpenChange={guardEscape(onOpenChange, popups)}>{props.children}</Base.Root>',
  },
  {
    label: 'the popover popup takes no tabIndex from its hook, so sixty lines with no control in them are out of reach of the keyboard',
    file: CLIENT,
    from: "      tabIndex={popup.tabIndex}\n",
    to: '',
  },
  {
    label: 'the tabIndex of the popover popup is written after the rest props, so tabIndex={-1} from a caller no longer opts out',
    file: CLIENT,
    from: "      tabIndex={popup.tabIndex}\n      {...rest}\n",
    to: "      {...rest}\n      tabIndex={popup.tabIndex}\n",
  },
  {
    label: 'the popover popup never hands its element to its hook, so nothing is measured and it is never a tab stop',
    file: CLIENT,
    from: "      ref={popup.ref}\n",
    to: '',
  },
  {
    label: 'the popover popup that does not scroll loses the tabindex of Base UI, so a popover of text alone cannot take the focus',
    file: HOOK,
    from: 'tabIndex: useScrollTabStop(ref) ?? -1,',
    to: 'tabIndex: useScrollTabStop(ref),',
  },
  {
    label: 'the popover popup is a tab stop whether or not it scrolls, so Tab stops on every small popover',
    file: HOOK,
    from: 'tabIndex: useScrollTabStop(ref) ?? -1,',
    to: 'tabIndex: 0 as const,',
  },
  {
    label: 'the ref a caller passes to the popover popup is taken by the hook and never filled',
    file: HOOK,
    from: '  useImperativeHandle(forwarded, () => ref.current as HTMLDivElement, [])\n',
    to: '',
  },
  {
    label: "the popover popup's own classes beat a consumer className",
    file: CLIENT,
    from: 'className={cn(POPOVER_POPUP, className)}',
    to: 'className={cn(className, POPOVER_POPUP)}',
  },
  {
    label: 'the popover popup drops the rest props, so id, aria-label, lang and its children never reach it',
    file: CLIENT,
    from: "      tabIndex={popup.tabIndex}\n      {...rest}\n",
    to: "      tabIndex={popup.tabIndex}\n",
  },
  {
    label: 'the popover popup never hands container to its portal, so it always mounts at the end of the body',
    file: CLIENT,
    from: '<Base.Portal container={container} keepMounted={keepMounted}>',
    to: '<Base.Portal keepMounted={keepMounted}>',
  },
  {
    label: 'the popover popup never hands keepMounted to its portal, so a closed popover always leaves the document',
    file: CLIENT,
    from: '<Base.Portal container={container} keepMounted={keepMounted}>',
    to: '<Base.Portal container={container}>',
  },
  {
    label: 'the popover delay loses its clamp, so a delay of 20000 makes the reader wait 20 seconds',
    file: CLIENT,
    from: 'delay={delay === undefined ? undefined : clamp(delay, delayMin, delayMax)}',
    to: 'delay={delay}',
  },
  {
    label: 'the popover closeDelay loses its clamp, so a closeDelay of 20000 keeps it open 20 seconds',
    file: CLIENT,
    from: 'closeDelay={closeDelay === undefined ? undefined : clamp(closeDelay, delayMin, delayMax)}',
    to: 'closeDelay={closeDelay}',
  },
  {
    label: 'a popover trigger with no delay forwards 300, so a change of the Base UI default never reaches it',
    file: CLIENT,
    from: 'delay={delay === undefined ? undefined : clamp(delay, delayMin, delayMax)}',
    to: 'delay={clamp(delay ?? POPOVER_DEFAULTS.delay, delayMin, delayMax)}',
  },
  {
    label: 'the popover delay loses its floor, so a negative or NaN delay reaches Base UI as given',
    file: CLIENT,
    from: 'clamp(delay, delayMin, delayMax)',
    to: 'Math.min(delay, delayMax)',
  },
  {
    label: 'the popover delays may run to a minute, six times what the schema says',
    file: 'src/components/popover/boundaries.ts',
    from: '  delayMax: 10000,',
    to: '  delayMax: 60000,',
  },
  {
    label: 'a className on the popover trigger never reaches the element passed as render',
    file: CLIENT,
    from: '      render={trigger.render}\n',
    to: '      render={render}\n',
  },
  {
    label: 'a className on a popover close is only appended to the classes of the Button passed as render',
    file: CLIENT,
    from: 'render={control.render} className={control.className}',
    to: 'render={render} className={className}',
  },
  {
    label: 'the popover x loses its name, so a screen reader announces a button and nothing else',
    file: CLIENT,
    from: '<Base.Close aria-label={label} {...rest} className={cn(POPOVER_CLOSE, className)}>',
    to: '<Base.Close {...rest} className={cn(POPOVER_CLOSE, className)}>',
  },
  {
    label: "the popover x puts its label after the rest props, so a caller's own aria-label is overwritten",
    file: CLIENT,
    from: '<Base.Close aria-label={label} {...rest} className={cn(POPOVER_CLOSE, className)}>',
    to: '<Base.Close {...rest} aria-label={label} className={cn(POPOVER_CLOSE, className)}>',
  },
  {
    label: 'the popover x is named by dialog.close, so a small panel is announced as a dialog to close',
    file: HOOK,
    from: 'useLabels().common.close',
    to: 'useLabels().dialog.close',
  },
  {
    label: 'a popover close with a label of its own draws the x over it, so Cancel becomes a second x',
    file: CLIENT,
    from: 'if (render !== undefined || hasContent(children)) {',
    to: 'if (render !== undefined) {',
  },
  {
    label: 'a popover close whose children are false or an empty string is an invisible button with no name, where it was the x',
    file: CLIENT,
    from: 'if (render !== undefined || hasContent(children)) {',
    to: 'if (render !== undefined || children != null) {',
  },
  {
    label: 'the popover popup gains a second hook call, where a part may hold only the one from hook.ts (R-5.12-1)',
    file: CLIENT,
    from: '  const { dir, lang } = usePopoverPositioner()\n',
    to: '  const { dir, lang } = usePopoverPositioner()\n  usePopoverClose()\n',
  },
  {
    label: 'the popover basic demo puts its label back on the trigger, where a server-built Button loses its truncating span',
    file: `${DUMMY}/basic.tsx`,
    from: '<PopoverTrigger render={<Button variant="outline" size="sm"><Svg icon={arrowSquareOut} />Share</Button>} />',
    to: '<PopoverTrigger render={<Button variant="outline" size="sm" />}><Svg icon={arrowSquareOut} />Share</PopoverTrigger>',
  },
  {
    label: 'the popover modal demo loses modal, so the panel that asks before deleting leaves the page behind it in use',
    file: `${DUMMY}/modal.tsx`,
    from: '<PopoverRoot modal>',
    to: '<PopoverRoot>',
  },
  {
    label: 'the popover modal demo loses its x, the PopoverClose a touch screen reader leaves by',
    file: `${DUMMY}/modal.tsx`,
    from: '            <PopoverClose />\n',
    to: '',
  },
  {
    label: 'the popover hover demo loses openOnHover, so its two delays do nothing and the pointer opens nothing',
    file: `${DUMMY}/hover.tsx`,
    from: '<PopoverTrigger openOnHover delay={100}',
    to: '<PopoverTrigger delay={100}',
  },
  {
    label: 'the popover form demo makes the popup itself the form, which puts role dialog on a form',
    file: `${DUMMY}/with-form.tsx`,
    from: '      <PopoverPopup>\n',
    to: '      <PopoverPopup render={<form />}>\n',
  },
  {
    label: 'the popover form demo loses onSubmit, so Save sends the page to itself and reloads it with ?name= on it',
    file: `${DUMMY}/with-form.tsx`,
    from: '<form className="grid gap-3" onSubmit={save}>',
    to: '<form className="grid gap-3">',
  },
  {
    label: 'the popover long-content demo writes a tabIndex by hand, which the popup takes for itself only while it scrolls',
    file: `${DUMMY}/long-content.tsx`,
    from: '      <PopoverPopup>\n',
    to: '      <PopoverPopup tabIndex={0}>\n',
  },
  {
    label: 'the popover rtl demo writes lang on its popup by hand, which the positioner takes from the provider',
    file: `${DUMMY}/rtl.tsx`,
    from: '          <PopoverPopup placement="start">\n',
    to: '          <PopoverPopup placement="start" lang="ar">\n',
  },
]
