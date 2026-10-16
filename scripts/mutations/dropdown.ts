// The mutations of src/components/dropdown. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/dropdown/client.tsx'
const CLASSES = 'src/components/dropdown/classes.ts'
const HOOK = 'src/components/dropdown/hook.ts'
const LIB = 'src/components/dropdown/lib.tsx'

export const MUTATIONS: Mutation[] = [
  {
    label: 'a dropdown href item stops rendering a link item, so a menu of links has no anchor to follow',
    file: CLIENT,
    from: '{item.href !== undefined && item.disabled !== true ? (',
    to: '{false ? (',
  },
  {
    label: 'a disabled dropdown href item is still a link, which Base UI cannot disable',
    file: CLIENT,
    from: '{item.href !== undefined && item.disabled !== true ? (',
    to: '{item.href !== undefined ? (',
  },
  {
    label: 'the dropdown menu ignores separatorBefore',
    file: CLIENT,
    from: "{item.separatorBefore === true ? <DropdownSeparator /> : null}",
    to: 'null',
  },
  {
    label: 'a dropdown Server Action runs outside a transition, so what it throws never reaches an error boundary',
    file: HOOK,
    from: 'startTransition(() => action(new FormData()))',
    to: 'void action(new FormData())',
  },
  {
    label: 'a dropdown link element delivered by Flight as a lazy wrapper is not unwrapped, and the menu throws',
    file: LIB,
    from: 'Children.toArray(link as ReactNode)[0]',
    to: 'link',
  },
  {
    label: 'a dropdown link row keeps the empty children key of renderLink, which erases its label',
    file: LIB,
    from: "return renderTrigger(renderLink('DropdownMenu', unwrapped as ReactElement | undefined, href, {}), undefined).render",
    to: "return renderLink('DropdownMenu', unwrapped as ReactElement | undefined, href, {})",
  },
  {
    label: 'the dropdown link item no longer closes the menu on a press, so a client-side navigation leaves it open',
    file: CLIENT,
    from: '<Base.LinkItem closeOnClick {...rest}',
    to: '<Base.LinkItem {...rest}',
  },
  {
    label: 'the dropdown root guards Escape by any dialog, so a menu mounted inside a dialog hands its key to the dialog',
    file: CLIENT,
    from: 'onOpenChange={guardEscape(onOpenChange, popups)}',
    to: 'onOpenChange={guardEscape(onOpenChange)}',
  },
  {
    label: 'the dropdown root drops its Escape guard, so one key closes a tooltip on a row and the menu under it',
    file: CLIENT,
    from: 'onOpenChange={guardEscape(onOpenChange, popups)}',
    to: 'onOpenChange={onOpenChange}',
  },
  {
    label: 'the dropdown root never shares its scope with its menu, so the guard finds no menu of its own',
    file: CLIENT,
    from: '<DropdownScopeContext value={scope}>',
    to: '<DropdownScopeContext value="">',
  },
  {
    label: 'the dropdown menu writes its scope under another attribute than the one its guard looks for',
    file: LIB,
    from: 'return `[data-dropdown="${scope}"]`',
    to: 'return `[data-popup="${scope}"]`',
  },
  {
    label: 'a scope of the caller replaces the one the dropdown root made',
    file: CLIENT,
    from: '      {...rest}\n      data-dropdown={popup.scope}\n',
    to: '      data-dropdown={popup.scope}\n      {...rest}\n',
  },
  {
    label: 'the dropdown positioner loses the direction of its provider, so bottom-start opens on the wrong edge in an RTL island',
    file: CLIENT,
    from: '        dir={dir}\n',
    to: '',
  },
  {
    label: 'the dropdown positioner loses the language of its provider, so an Arabic menu on an English page is read in an English voice',
    file: CLIENT,
    from: '        lang={lang}\n',
    to: '',
  },
  {
    label: 'the dropdown positioner is stamped ltr when no provider is mounted',
    file: CLIENT,
    from: '        dir={dir}\n',
    to: "        dir={dir ?? 'ltr'}\n",
  },
  {
    label: 'the dropdown drops the alignment half of its placement, so bottom-start opens centred',
    file: CLIENT,
    from: '        align={align}\n',
    to: '',
  },
  {
    label: 'the dropdown forgets the shared side offset, so the menu touches its trigger',
    file: CLIENT,
    from: '        sideOffset={POPUP_BOUNDS.sideOffset}\n',
    to: '',
  },
  {
    label: "the dropdown falls back to Base UI's 5 px collision padding instead of the shared 8",
    file: CLIENT,
    from: '        collisionPadding={POPUP_BOUNDS.collisionPadding}\n',
    to: '',
  },
  {
    label: 'the dropdown default placement becomes bottom, centred under its trigger',
    file: 'src/components/dropdown/constants.ts',
    from: '  placement: DEFAULT_PLACEMENT,',
    to: "  placement: 'bottom',",
  },
  {
    label: 'the dropdown menu loses its row cap, so sixty rows run as tall as the room beside the trigger',
    file: CLASSES,
    from: '  LIST_CAP,\n',
    to: '',
  },
  {
    label: 'the dropdown menu loses SCROLL_AREA, so sixty rows paint over the page instead of scrolling',
    file: CLASSES,
    from: '  SCROLL_AREA,\n',
    to: '',
  },
  {
    label: 'the dropdown menu draws no ring when it holds the focus itself',
    file: CLASSES,
    from: '  FOCUS_RING_INSET,\n].join',
    to: "  'outline-none',\n].join",
  },
  {
    label: 'the dropdown menu is a tab stop never, so a scrolling menu a press opened cannot be reached',
    file: CLIENT,
    from: '      tabIndex={popup.tabIndex}\n',
    to: '',
  },
  {
    label: 'the dropdown menu grows to the width of the screen for one long label',
    file: CLASSES,
    from: 'max-w-[min(calc(var(--spacing)*80),var(--available-width))]',
    to: 'max-w-(--available-width)',
  },
  {
    label: 'the dropdown menu keeps 12rem at a doubled text size, wider than a phone',
    file: CLASSES,
    from: 'min-w-[min(calc(var(--spacing)*48),var(--available-width))]',
    to: 'min-w-48',
  },
  {
    label: 'a dropdown shortcut is capped at half its row, so a short row cuts a real shortcut',
    file: CLASSES,
    from: 'max-w-[min(calc(var(--spacing)*40),calc(var(--available-width)/2))]',
    to: 'max-w-1/2',
  },
  {
    label: 'a dropdown link item drops the colour of its tone, so a destructive link looks like any other',
    file: CLIENT,
    from: '<Base.LinkItem closeOnClick {...rest} data-tone={tone} className={cn(DROPDOWN_ITEM, DROPDOWN_ITEM_TONE[tone], className)}>',
    to: '<Base.LinkItem closeOnClick {...rest} data-tone={tone} className={cn(DROPDOWN_ITEM, className)}>',
  },
  {
    label: 'a dropdown shortcut keeps its width beside a label it cuts, so at a doubled text size a row loses its name',
    file: CLASSES,
    from: ' shrink-10000 truncate ps-4',
    to: ' shrink-0 truncate ps-4',
  },
  {
    label: 'a dropdown shortcut gives way only as fast as its label, so both are cut where the hint alone could give the room',
    file: CLASSES,
    from: ' shrink-10000 truncate ps-4',
    to: ' truncate ps-4',
  },
  {
    label: 'a dropdown shortcut stays muted on a highlighted row, and grey on the system highlight under forced colours',
    file: CLASSES,
    from: ' group-data-highlighted:text-inherit',
    to: '',
  },
  {
    label: 'a disabled dropdown row dims itself, highlight and all, so its focus mark fades',
    file: CLASSES,
    from: 'data-disabled:*:opacity-50',
    to: 'data-disabled:opacity-50',
  },
  {
    label: 'a disabled dropdown row under forced colours loses the grey of the system',
    file: CLASSES,
    from: ' forced-colors:data-disabled:not-data-highlighted:text-[GrayText]',
    to: '',
  },
  {
    label: 'a dropdown row stays 40 px under a finger',
    file: CLASSES,
    from: ' pointer-coarse:min-h-[var(--tc-target-coarse,44px)]',
    to: '',
  },
  {
    label: 'a highlighted danger dropdown row keeps the primary fill',
    file: CLASSES,
    from: "danger: 'text-danger-on-soft data-highlighted:bg-danger-soft data-highlighted:text-danger-on-soft',",
    to: "danger: 'text-danger-on-soft',",
  },
  {
    label: 'a dropdown positioner whose trigger scrolls out of view stays painted over the page',
    file: CLASSES,
    from: "'z-(--tc-z-popup) data-anchor-hidden:invisible'",
    to: "'z-(--tc-z-popup)'",
  },
  {
    label: 'a dropdown row drops the shared highlight, so the row the keyboard is on has neither fill nor ring',
    file: CLASSES,
    from: '  ROW,\n  ROW_HIGHLIGHT,\n',
    to: '  ROW,\n',
  },
  {
    label: 'the dropdown icon is read out with the label',
    file: LIB,
    from: '<span aria-hidden="true" className={DROPDOWN_ICON}>',
    to: '<span className={DROPDOWN_ICON}>',
  },
  {
    label: 'the dropdown label bound is 300 characters',
    file: 'src/components/dropdown/boundaries.ts',
    from: '  labelMaxLength: 100,',
    to: '  labelMaxLength: 300,',
  },
  {
    label: 'the dropdown trigger forwards a delay unclamped',
    file: CLIENT,
    from: 'delay={delay === undefined ? undefined : clamp(delay, delayMin, delayMax)}',
    to: 'delay={delay}',
  },
]
