// The mutations of src/components/accordion. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/accordion/client.tsx'
const CLASSES = 'src/components/accordion/classes.ts'
const CONSTANTS = 'src/components/accordion/constants.ts'
const TYPES = 'src/components/accordion/types.ts'
const LIB = 'src/components/accordion/lib.ts'
const HOOK = 'src/components/accordion/hook.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the accordion loses its hiddenUntilFound default, so the text of a closed panel leaves the server HTML',
    file: CONSTANTS,
    from: 'hiddenUntilFound: true,',
    to: 'hiddenUntilFound: false,',
  },
  {
    label: 'an accordion panel keeps the region role Base UI gives it, so every closed panel is an empty landmark',
    file: CLIENT,
    from: '<Base.Panel role={undefined} aria-labelledby={undefined} className',
    to: '<Base.Panel className',
  },
  {
    label: 'the region of an accordion panel loses its name, so a screen reader hears a region of nothing',
    file: CLIENT,
    from: '          aria-labelledby={item.triggerId}\n',
    to: '',
  },
  {
    label: 'the accordion trigger loses the id its region is named by, so the name points at nothing',
    file: CLIENT,
    from: '<Base.Trigger id={item.triggerId} onClick={item.onClick}',
    to: '<Base.Trigger onClick={item.onClick}',
  },
  {
    label: 'the region of an accordion panel is never a tab stop, so the keyboard cannot scroll a wide table',
    file: CLIENT,
    from: '          tabIndex={item.tabIndex}\n',
    to: '',
  },
  {
    label: 'an accordion heading level loses its clamp, so 9 asks React for a tag that does not exist',
    file: LIB,
    from: 'clamp(Math.round(level), headingLevelMin, headingLevelMax)',
    to: 'Math.round(level)',
  },
  {
    label: 'an accordion item with no headingLevel is an h2, though the schema and the README say h3',
    file: CONSTANTS,
    from: 'headingLevel: 3,',
    to: 'headingLevel: 2,',
  },
  {
    label: 'the accordion lets a heading level reach 1, the level of the page title, which has no tag in its table',
    file: 'src/components/accordion/boundaries.ts',
    from: 'headingLevelMin: 2,',
    to: 'headingLevelMin: 1,',
  },
  {
    label: 'the accordion caret takes its colour on the svg again, where forced colours keep it dark grey on black',
    file: CLIENT,
    from: '<span className={ACCORDION_CARET}><Svg icon={caretDown} flipRtl={false} /></span>',
    to: '<span><Svg icon={caretDown} flipRtl={false} className={ACCORDION_CARET} /></span>',
  },
  {
    label: 'the accordion caret is mirrored in Arabic, though a down caret has no direction',
    file: CLIENT,
    from: '<Svg icon={caretDown} flipRtl={false} />',
    to: '<Svg icon={caretDown} />',
  },
  {
    label: 'the first and last accordion trigger lose the radius of the box, so its corners cut their focus ring',
    file: CLASSES,
    from: '  ACCORDION_TRIGGER_CORNERS,\n',
    to: '',
  },
  {
    label: 'the accordion finds its first trigger by first: on the trigger, which every trigger is in its own heading',
    file: CLASSES,
    from: "'[:first-child>*>&]:rounded-t-box [",
    to: "'first:rounded-t-box [",
  },
  {
    label: 'the last accordion trigger keeps its round corners while its panel is open below it',
    file: CLASSES,
    from: ':not-data-panel-open:rounded-b-box',
    to: ':rounded-b-box',
  },
  {
    label: 'the region of an accordion panel loses its 4 px above, so the ring of a control on its first line is cut',
    file: CLASSES,
    from: 'px-3.5 pt-1 pb-3.5',
    to: 'px-3.5 pb-3.5',
  },
  {
    label: 'the accordion box is no longer one grid column, so a wide table in a panel widens a parent that fits its content',
    file: CLASSES,
    from: 'grid grid-cols-1 overflow-hidden',
    to: 'overflow-hidden',
  },
  {
    label: 'the accordion box no longer clips, so a fill a caller gives an item pokes out of the round corners',
    file: CLASSES,
    from: 'grid grid-cols-1 overflow-hidden rounded-box',
    to: 'grid grid-cols-1 rounded-box',
  },
  {
    label: 'the accordion box no longer breaks a long word, so a 300-letter title runs out of it',
    file: CLASSES,
    from: ' text-body wrap-anywhere ',
    to: ' text-body ',
  },
  {
    label: 'the region of an accordion panel no longer scrolls sideways, so the box cuts a wide table off',
    file: CLASSES,
    from: 'pb-4 ${SCROLL_X} ${FOCUS_RING_INSET}',
    to: 'pb-4 ${FOCUS_RING_INSET}',
  },
  {
    label: 'the accordion trigger loses its inset focus ring, so the keyboard shows no focus on it',
    file: CLASSES,
    from: '  HOVER.ghost,\n  FOCUS_RING_INSET,\n',
    to: '  HOVER.ghost,\n',
  },
  {
    label: 'the accordion panel loses its fade, so it appears and goes in one frame in every mode',
    file: CLASSES,
    from: '`text-sm text-muted ${FADE_MOTION}`',
    to: "'text-sm text-muted'",
  },
  {
    label: 'the accordion caret no longer turns when its panel opens',
    file: CLASSES,
    from: ' group-data-panel-open:rotate-180',
    to: '',
  },
  {
    label: 'a disabled accordion trigger keeps half its opacity under forced colours instead of the grey of the system',
    file: CLASSES,
    from: '  ACCORDION_TRIGGER_FORCED,\n',
    to: '',
  },
  {
    label: 'the caret of a disabled accordion trigger keeps the full text colour under forced colours',
    file: CLASSES,
    from: "  'forced-colors:group-data-disabled:text-[GrayText]',\n",
    to: '',
  },
  {
    label: 'the accordion title no longer takes the room, so it wraps at six letters however wide its trigger is',
    file: CLASSES,
    from: "'min-w-0 grow basis-[6ch]'",
    to: "'min-w-0 basis-[6ch]'",
  },
  {
    label: 'the accordion title may shrink to nothing, so at 320 px and text at 200% a nested title is 0 px and one letter a line',
    file: CLASSES,
    from: "'min-w-0 grow basis-[6ch]'",
    to: "'min-w-0 grow basis-0'",
  },
  {
    label: 'an accordion trigger never wraps, so where its title and caret do not fit side by side the title is squeezed to 0 px',
    file: CLASSES,
    from: "'group flex w-full flex-wrap items-center",
    to: "'group flex w-full items-center",
  },
  {
    label: 'an accordion caret that wraps below its title sits at the inline start, under the first letter',
    file: CLASSES,
    from: "'ms-auto flex shrink-0 text-muted",
    to: "'flex shrink-0 text-muted",
  },
  {
    label: 'an accordion item keeps its line above when it is the first, doubling the edge of the box',
    file: CLASSES,
    from: " border-line first:border-t-0'",
    to: " border-line'",
  },
  {
    label: 'AccordionRoot puts the consumer className first, so the classes of the accordion box win every conflict',
    file: CLIENT,
    from: 'cn(ACCORDION_ROOT, className)',
    to: 'cn(className, ACCORDION_ROOT)',
  },
  {
    label: "the accordion index.tsx gains 'use client', so a server page can no longer write the titles and the panels",
    file: 'src/components/accordion/index.tsx',
    from: '// R-5.1-2: re-exports only',
    to: "'use client'\n// R-5.1-2: re-exports only",
  },
  {
    label: 'an accordion demo item loses its headingLevel, so it is an h3 under the h1 and axe reports the skipped level',
    file: 'src/components/accordion/dummy/basic.tsx',
    from: 'title="What is a server component?" headingLevel={2}',
    to: 'title="What is a server component?"',
  },
  {
    label: 'the accordion root takes loopFocus again, a prop Base UI 1.8.0 deprecates and no longer acts on',
    file: TYPES,
    from: "'className' | 'loopFocus' | 'orientation'",
    to: "'className' | 'orientation'",
  },
  {
    label: 'an accordion item no longer needs a value, so the root has nothing to name it by',
    file: TYPES,
    from: '    value: string\n',
    to: '    value?: string\n',
  },
  {
    label: 'an accordion trigger is not held, so closing a long answer above throws the pressed trigger and its focus off the screen',
    file: CLIENT,
    from: ' onClick={item.onClick}',
    to: '',
  },
  {
    label: 'the accordion hold scrolls the page by the wrong sign, so a pressed trigger runs twice as far off the screen',
    file: HOOK,
    from: 'scroller.scrollBy(0, moved)',
    to: 'scroller.scrollBy(0, -moved)',
  },
  {
    label: 'the accordion hold always scrolls the page, so a trigger in a box that scrolls is left to run off it',
    file: HOOK,
    from: "if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node",
    to: "if (overflowY === 'never') return node",
  },
  {
    label: 'the accordion hold forgets where the reader scrolled, so a scroll during the fade is undone',
    file: HOOK,
    from: "document.addEventListener('scroll', scrolled, { capture: true, passive: true })",
    to: '',
  },
  {
    label: 'the accordion hold never lets go, so a panel that resizes minutes later still scrolls the page',
    file: HOOK,
    from: '    sizes.disconnect()\n',
    to: '',
  },
]
