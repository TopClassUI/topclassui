// The mutations of src/components/dialog. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/dialog/client.tsx'
const CLASSES = 'src/components/dialog/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the dialog body loses SCROLL_AREA, so a long body pushes the footer out of the popup instead of scrolling',
    file: CLASSES,
    from: 'text-sm text-muted ${SCROLL_AREA} ${FOCUS_RING_INSET}`',
    to: 'text-sm text-muted ${FOCUS_RING_INSET}`',
  },
  {
    label: 'the dialog body loses its inset ring, so a body the keyboard lands on shows no focus: the ring outside its box is clipped',
    file: CLASSES,
    from: 'text-sm text-muted ${SCROLL_AREA} ${FOCUS_RING_INSET}`',
    to: 'text-sm text-muted ${SCROLL_AREA}`',
  },
  {
    label: 'the dialog body loses its one-line floor, so a tall header and footer squeeze it to nothing on a small phone',
    file: CLASSES,
    from: '`min-h-15 flex-1 px-5 py-5',
    to: '`min-h-0 flex-1 px-5 py-5',
  },
  {
    label: 'the dialog popup clips instead of scrolling, so an action below the screen of a small phone can never be reached',
    file: CLASSES,
    from: "w-full flex-col wrap-anywhere',\n  SCROLL_AREA,",
    to: "w-full flex-col wrap-anywhere overflow-hidden',",
  },
  {
    label: 'the dialog popup stops breaking a long word, so a 300-character word makes the body scroll sideways',
    file: CLASSES,
    from: 'w-full flex-col wrap-anywhere',
    to: 'w-full flex-col',
  },
  {
    label: 'the dialog popup loses its maximum height, so a long body runs off the bottom of the screen',
    file: CLASSES,
    from: "'flex max-h-[calc(100dvh-2*var(--tc-overlay-inset))] w-full",
    to: "'flex w-full",
  },
  {
    label: 'the dialog viewport loses its inset, so the popup touches the edges of a phone',
    file: CLASSES,
    from: 'grid place-items-center p-(--tc-overlay-inset)',
    to: 'grid place-items-center',
  },
  {
    label: 'the dialog scrim leaves the dialog layer, so a sticky bar of the page paints over it',
    file: CLASSES,
    from: '`${SCRIM} z-(--tc-z-dialog) ${FADE_MOTION}`',
    to: '`${SCRIM} ${FADE_MOTION}`',
  },
  {
    label: 'the dialog md width becomes 512 px, the width of lg',
    file: CLASSES,
    from: "md: 'max-w-100',",
    to: "md: 'max-w-128',",
  },
  {
    label: 'the dialog header lets its title column keep its content width, so a long title pushes the x out',
    file: CLASSES,
    from: "export const DIALOG_HEADING = 'min-w-0 flex-1'",
    to: "export const DIALOG_HEADING = 'flex-1'",
  },
  {
    label: 'the dialog x loses the icon button classes, so it is 16 px wide under a finger and has no ring',
    file: CLASSES,
    from: '`${ICON_BUTTON} text-muted tone-neutral ${HOVER.ghost}`',
    to: '`text-muted tone-neutral ${HOVER.ghost}`',
  },
  {
    label: 'the dialog viewport loses the direction of its provider, so the dialog of an RTL island has its x on the right and its text left-aligned',
    file: CLIENT,
    from: '<Base.Viewport dir={direction} className={DIALOG_VIEWPORT}>',
    to: '<Base.Viewport className={DIALOG_VIEWPORT}>',
  },
  {
    label: "the dialog popup's own classes beat a consumer className",
    file: CLIENT,
    from: 'className={cn(DIALOG_POPUP, DIALOG_WIDTH[size], className)}',
    to: 'className={cn(className, DIALOG_POPUP, DIALOG_WIDTH[size])}',
  },
  {
    label: 'the dialog popup ignores its size, so every dialog is 400 px wide',
    file: CLIENT,
    from: 'className={cn(DIALOG_POPUP, DIALOG_WIDTH[size], className)}',
    to: 'className={cn(DIALOG_POPUP, DIALOG_WIDTH.md, className)}',
  },
  {
    label: 'the dialog popup drops the rest props, so ref, id, lang, initialFocus and its children never reach it',
    file: CLIENT,
    from: '<Base.Popup data-size={size} {...rest} className=',
    to: '<Base.Popup data-size={size} className=',
  },
  {
    label: 'the dialog root forwards only its children, so open, onOpenChange and disablePointerDismissal never reach Base UI',
    file: CLIENT,
    from: 'return <Base.Root {...props} />',
    to: 'return <Base.Root>{props.children}</Base.Root>',
  },
  {
    label: 'the dialog root turns modal off, so the page behind scrolls and stays readable to a screen reader',
    file: CLIENT,
    from: 'return <Base.Root {...props} />',
    to: 'return <Base.Root {...props} modal={false} />',
  },
  {
    label: 'the dialog header always draws its x, so closeButton={false} does nothing',
    file: CLIENT,
    from: '{closeButton ? <DialogClose /> : null}',
    to: '<DialogClose />',
  },
  {
    label: 'the dialog header drops the rest props, so ref, id and style never reach it',
    file: CLIENT,
    from: '<div {...rest} className={cn(DIALOG_HEADER, className)}>',
    to: '<div className={cn(DIALOG_HEADER, className)}>',
  },
  {
    label: 'the dialog body drops the rest props, so the tabIndex that lets a keyboard reach a long text never arrives',
    file: CLIENT,
    from: 'return <div {...rest} className={cn(DIALOG_BODY, className)} />',
    to: 'return <div className={cn(DIALOG_BODY, className)}>{rest.children}</div>',
  },
  {
    label: 'the dialog x loses its name, so a screen reader announces a button and nothing else',
    file: CLIENT,
    from: '<Base.Close aria-label={label} {...rest} className={cn(DIALOG_CLOSE, className)}>',
    to: '<Base.Close {...rest} className={cn(DIALOG_CLOSE, className)}>',
  },
  {
    label: "the dialog x puts its label after the rest props, so a caller's own aria-label is overwritten",
    file: CLIENT,
    from: '<Base.Close aria-label={label} {...rest} className={cn(DIALOG_CLOSE, className)}>',
    to: '<Base.Close {...rest} aria-label={label} className={cn(DIALOG_CLOSE, className)}>',
  },
  {
    label: 'the dialog x is named by common.close, the one word a screen reader cannot tell from any other close',
    file: 'src/components/dialog/hook.ts',
    from: 'useLabels().dialog.close',
    to: 'useLabels().common.close',
  },
  {
    label: 'a dialog close with a label of its own draws the x over it, so Cancel becomes a second x',
    file: CLIENT,
    from: 'if (render !== undefined || children != null) {',
    to: 'if (render !== undefined) {',
  },
  {
    label: 'a dialog close whose children render nothing is an empty button with no name, where it was the x',
    file: CLIENT,
    from: 'if (render !== undefined || children != null) {',
    to: 'if (render !== undefined || children !== undefined) {',
  },
  {
    label: 'a className on the dialog trigger never reaches the element passed as render',
    file: CLIENT,
    from: '<Base.Trigger {...rest} render={trigger.render} className={trigger.className} />',
    to: '<Base.Trigger {...rest} render={render} className={trigger.className} />',
  },
  {
    label: 'a className on a dialog close is only appended to the classes of the Button passed as render',
    file: CLIENT,
    from: 'render={control.render} className={control.className}',
    to: 'render={render} className={className}',
  },
  {
    label: 'the dialog popup gains a second hook call, where a part may hold only the one from hook.ts (R-5.12-1)',
    file: CLIENT,
    from: '  const { direction } = useDialogPopup()\n',
    to: '  const { direction } = useDialogPopup()\n  useDialogClose()\n',
  },
  {
    label: 'the dialog default size becomes lg, so a dialog with no size is 512 px wide',
    file: 'src/components/dialog/constants.ts',
    from: '  size: DEFAULT_SIZE,',
    to: "  size: 'lg',",
  },
  {
    label: 'the dialog header hides its x unless asked, so a dialog with no footer has no control that closes it',
    file: 'src/components/dialog/constants.ts',
    from: '  closeButton: true,',
    to: '  closeButton: false,',
  },
  {
    label: 'the dialog basic demo puts its label back on the trigger, the form a Button rendered on the server drops',
    file: 'src/components/dialog/dummy/basic.tsx',
    from: '<DialogTrigger render={<Button>Publish</Button>} />',
    to: '<DialogTrigger render={<Button />}>Publish</DialogTrigger>',
  },
  {
    label: 'the dialog form demo makes its form a box, so the three bars stop being the column of the popup and the body no longer scrolls',
    file: 'src/components/dialog/dummy/with-form.tsx',
    from: '<form className="contents">',
    to: '<form>',
  },
  {
    label: 'the dialog long-body demo drops its tabIndex, so axe reports a scrolling region the keyboard cannot reach',
    file: 'src/components/dialog/dummy/long-body.tsx',
    from: '<DialogBody tabIndex={0} className="grid gap-3">',
    to: '<DialogBody className="grid gap-3">',
  },
  {
    label: 'the dialog confirm demo loses disablePointerDismissal, so a stray press outside dismisses a destructive question',
    file: 'src/components/dialog/dummy/confirm.tsx',
    from: '<DialogRoot disablePointerDismissal>',
    to: '<DialogRoot>',
  },
]
