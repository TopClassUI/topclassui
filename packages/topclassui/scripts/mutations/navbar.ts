// The mutations of src/components/navbar. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const CLASSES = 'src/components/navbar/classes.ts'
const CONSTANTS = 'src/components/navbar/constants.ts'
const HOOK = 'src/components/navbar/hook.ts'
const LIB = 'src/components/navbar/lib.ts'
const ROOT = 'src/components/navbar/parts/navbar-root.tsx'
const BRAND = 'src/components/navbar/parts/navbar-brand.tsx'
const LINKS = 'src/components/navbar/parts/navbar-links.tsx'
const LINK = 'src/components/navbar/parts/navbar-link.tsx'

export const MUTATIONS: Mutation[] = [
  // The one client part: the height of the bar, written for the page to read.
  {
    label: 'the navbar hook stops setting the variable, so an anchor and a focused link land under the sticky bar',
    file: HOOK,
    from: '      root.style.setProperty(NAVBAR_OFFSET_VARIABLE, `${String(unstuck ? 0 : height)}px`)\n',
    to: '',
  },
  {
    label: 'the navbar hook never removes the variable, so a page without the bar keeps its height clear for nothing',
    file: HOOK,
    from: '      root.style.removeProperty(NAVBAR_OFFSET_VARIABLE)\n',
    to: '',
  },
  {
    label: 'the navbar hook leaves its observer connected after the bar unmounts',
    file: HOOK,
    from: '      sizes.disconnect()\n',
    to: '',
  },
  {
    label: 'the navbar hook rounds the height down, so a bar of 60.25 px covers a quarter pixel of what lands under it',
    file: HOOK,
    from: 'Math.ceil(bar.getBoundingClientRect().height)',
    to: 'Math.floor(bar.getBoundingClientRect().height)',
  },
  {
    label: 'the navbar hook writes the height once and watches nothing, so a bar that wraps is not followed',
    file: HOOK,
    from: "    sizes.observe(bar, { box: 'border-box' })\n",
    to: '',
  },
  {
    label: 'the navbar hook waits for a resize before it writes anything, so a bar that never resizes writes nothing',
    file: HOOK,
    from: "    view.addEventListener('resize', publish)\n    publish()\n",
    to: "    view.addEventListener('resize', publish)\n",
  },
  {
    label: 'the navbar hook watches the content box, which a growing safe area does not always change',
    file: HOOK,
    from: "sizes.observe(bar, { box: 'border-box' })",
    to: 'sizes.observe(bar)',
  },
  {
    label: 'the navbar hook measures its own hidden span, which is 0 px tall, and not the header',
    file: HOOK,
    from: 'const bar = ref.current?.parentElement',
    to: 'const bar = ref.current',
  },
  {
    label: 'the navbar hook never lets go of the top, so at a 32 px root three rows cover two thirds of a phone',
    file: HOOK,
    from: 'const unstuck = height > root.clientHeight * NAVBAR_STICKY_SHARE',
    to: 'const unstuck = false && height > root.clientHeight * NAVBAR_STICKY_SHARE',
  },
  {
    label: 'the navbar hook lets go of a bar of exactly its share of the screen',
    file: HOOK,
    from: 'height > root.clientHeight * NAVBAR_STICKY_SHARE',
    to: 'height >= root.clientHeight * NAVBAR_STICKY_SHARE',
  },
  {
    label: 'the navbar hook measures the window, which grows as a phone hides its address bar, so the bar sticks and lets go as the page scrolls',
    file: HOOK,
    from: 'height > root.clientHeight * NAVBAR_STICKY_SHARE',
    to: 'height > view.innerHeight * NAVBAR_STICKY_SHARE',
  },
  {
    label: 'the navbar may cover half the screen before it lets go',
    file: CONSTANTS,
    from: 'export const NAVBAR_STICKY_SHARE = 1 / 3',
    to: 'export const NAVBAR_STICKY_SHARE = 1 / 2',
  },
  {
    label: 'the navbar hook writes the height of a bar that has let go, so the page keeps room clear for a bar that is not there',
    file: HOOK,
    from: '`${String(unstuck ? 0 : height)}px`',
    to: '`${String(height)}px`',
  },
  {
    label: 'the navbar hook does not follow the window, so a screen that grows shorter keeps a bar that covers half of it',
    file: HOOK,
    from: "    view.addEventListener('resize', publish)\n",
    to: '',
  },
  {
    label: 'the navbar hook keeps listening to the window after the bar unmounts',
    file: HOOK,
    from: "      view.removeEventListener('resize', publish)\n",
    to: '',
  },
  {
    label: 'the navbar hook leaves data-unstuck on a bar that stops being sticky',
    file: HOOK,
    from: "      bar.removeAttribute('data-unstuck')\n",
    to: '',
  },
  {
    label: 'a navbar marked unstuck still sticks, and covers the page',
    file: CLASSES,
    from: ' data-unstuck:static ',
    to: ' ',
  },
  {
    label: 'the navbar hook leaves a page opened at an #anchor with its heading under the bar',
    file: HOOK,
    from: '    if (target && landed !== undefined && Math.abs(landed - padding) < 1) target.scrollIntoView()\n',
    to: '',
  },
  {
    label: 'the navbar hook scrolls to the #anchor target though the reader has scrolled away from it',
    file: HOOK,
    from: 'Math.abs(landed - padding) < 1',
    to: 'landed === landed',
  },
  {
    label: 'the navbar hook reads an escaped #fragment as written, so an id with an accent is never found',
    file: LIB,
    from: '    return doc.getElementById(decodeURIComponent(fragment))\n',
    to: '    return null\n',
  },
  {
    label: 'the navbar hook throws on a #fragment with a stray %, and the bar never writes its height',
    file: LIB,
    from: '  try {\n    return doc.getElementById(decodeURIComponent(fragment))\n  } catch {\n    // A stray % is no escape: the fragment names nothing.\n    return null\n  }\n',
    to: '  return doc.getElementById(decodeURIComponent(fragment))\n',
  },
  {
    label: 'the navbar writes its height to the variable of a bottom bar, which the top of the page never reads',
    file: CONSTANTS,
    from: "export const NAVBAR_OFFSET_VARIABLE = '--tc-sticky-top'",
    to: "export const NAVBAR_OFFSET_VARIABLE = '--tc-sticky-bottom'",
  },
  // The root.
  {
    label: 'a sticky navbar root no longer mounts its client part, so nothing tells the page how tall it is',
    file: ROOT,
    from: '{sticky ? <NavbarOffset /> : null}',
    to: '{null}',
  },
  {
    label: 'a navbar root that is not sticky still mounts the client part, and writes a height the page does not need',
    file: ROOT,
    from: '{sticky ? <NavbarOffset /> : null}',
    to: '<NavbarOffset />',
  },
  {
    label: 'the navbar root is not sticky by default',
    file: CONSTANTS,
    from: '  sticky: true,',
    to: '  sticky: false,',
  },
  {
    label: 'the navbar root drops the rest props, so id, data-*, style and ref never reach the header',
    file: ROOT,
    from: ' {...rest}>',
    to: '>',
  },
  {
    label: 'the navbar root passes className first, so the consumer loses every conflict',
    file: ROOT,
    from: "cn(NAVBAR_ROOT, NAVBAR_TOP[sticky ? 'sticky' : 'flow'], className)",
    to: "cn(className, NAVBAR_ROOT, NAVBAR_TOP[sticky ? 'sticky' : 'flow'])",
  },
  {
    label: 'a navbar root that is not sticky still wears the sticky classes',
    file: ROOT,
    from: "NAVBAR_TOP[sticky ? 'sticky' : 'flow']",
    to: "NAVBAR_TOP['sticky']",
  },
  {
    label: 'the navbar bar no longer wraps, so a brand and two actions push a 320 px page wide',
    file: CLASSES,
    from: "'flex min-h-13 w-full flex-wrap items-center gap-x-4 gap-y-2 pb-1'",
    to: "'flex min-h-13 w-full items-center gap-x-4 gap-y-2 pb-1'",
  },
  {
    label: 'the navbar side padding is px-4 beside the safe utilities again, which leave the bar no side padding at all',
    file: CLASSES,
    from: "'ps-[calc(1rem+var(--tc-safe-start))] pe-[calc(1rem+var(--tc-safe-end))]'",
    to: "'px-4 ps-safe pe-safe'",
  },
  {
    label: 'a sticky navbar ignores the safe area at the top, so a notch covers its first row',
    file: CLASSES,
    from: 'pt-[calc(0.375rem+var(--tc-safe-top))]',
    to: 'pt-1.5',
  },
  {
    label: 'the navbar bar loses the line along its foot, its one edge under forced colours',
    file: CLASSES,
    from: "'bg-surface-raised border-b-(length:--tc-line-width) border-line'",
    to: "'bg-surface-raised'",
  },
  {
    label: 'the navbar bar is no longer on the sticky layer, so page content can paint over it',
    file: CLASSES,
    from: 'sticky: `${STICKY_TOP} ',
    to: "sticky: `sticky top-0 ",
  },
  // The brand.
  {
    label: 'the navbar brand no longer clips what it holds, so an element inside it paints across the page',
    file: CLASSES,
    from: "'inline-flex items-center gap-2 overflow-hidden rounded-control text-base font-semibold text-body'",
    to: "'inline-flex items-center gap-2 rounded-control text-base font-semibold text-body'",
  },
  {
    label: 'the navbar brand loses its 24 px and 44 px target',
    file: CLASSES,
    from: '  CONTAIN,\n  FOCUS_RING,\n  TOUCH_TARGET,\n].join',
    to: '  CONTAIN,\n  FOCUS_RING,\n].join',
  },
  {
    label: 'the navbar brand loses its focus ring',
    file: CLASSES,
    from: '  CONTAIN,\n  FOCUS_RING,\n  TOUCH_TARGET,\n].join',
    to: '  CONTAIN,\n  TOUCH_TARGET,\n].join',
  },
  {
    label: 'the navbar brand ignores its render element, so a framework link is replaced by a plain anchor',
    file: BRAND,
    from: 'renderElement(render ?? <a />, {',
    to: 'renderElement(<a />, {',
  },
  {
    label: 'the navbar brand no longer puts its text in a span of its own, so a long name cannot end in an ellipsis',
    file: BRAND,
    from: '    children: truncateLabel(children, NAVBAR_BOUNDARIES.labelMaxLength),',
    to: '    children,',
  },
  {
    label: 'the navbar brand drops the rest props, so its href never reaches the anchor',
    file: BRAND,
    from: '    ...rest,\n',
    to: '',
  },
  // The nav and its list.
  {
    label: 'the navbar nav is a plain box, so its list widens the bar and a flex parent to the width of all its links',
    file: CLASSES,
    from: "export const NAVBAR_LINKS = 'grid min-w-0 grow basis-24 grid-cols-1'",
    to: "export const NAVBAR_LINKS = 'min-w-0 grow basis-24'",
  },
  {
    label: 'the navbar nav has no room of its own to ask for, so a brand and two actions squeeze it to a sliver',
    file: CLASSES,
    from: "export const NAVBAR_LINKS = 'grid min-w-0 grow basis-24 grid-cols-1'",
    to: "export const NAVBAR_LINKS = 'grid min-w-0 grow basis-0 grid-cols-1'",
  },
  {
    label: 'the navbar list no longer scrolls sideways, so six links push a phone page wide',
    file: CLASSES,
    from: 'hover:snap-none ${NAVBAR_LIST_ROOM} ${SCROLL_X}`',
    to: 'hover:snap-none ${NAVBAR_LIST_ROOM}`',
  },
  {
    label: 'the navbar list no longer snaps, so Tab leaves a link that was half in view cut in half',
    file: CLASSES,
    from: 'flex items-center gap-4 snap-x snap-mandatory hover:snap-none ',
    to: 'flex items-center gap-4 ',
  },
  {
    label: 'the navbar list snaps under the pointer too, so a wheel springs back to a link that keeps the focus',
    file: CLASSES,
    from: 'snap-x snap-mandatory hover:snap-none ',
    to: 'snap-x snap-mandatory ',
  },
  {
    label: 'a focused navbar link is no snap area, so the list that snaps has nothing to snap to',
    file: CLASSES,
    from: "  'focus-visible:snap-center',\n",
    to: '',
  },
  {
    label: 'the navbar list keeps -m-1 and p-1 for the ring, which a root font of 10 px shrinks under its reach',
    file: CLASSES,
    from: "'-m-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+1px)] p-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+1px)]'",
    to: "'-m-1 p-1'",
  },
  {
    label: 'a navbar list item can be squeezed by its neighbours instead of scrolling',
    file: CLASSES,
    from: 'export const NAVBAR_ITEM = `flex shrink-0 ${CONTAIN}`',
    to: 'export const NAVBAR_ITEM = `flex ${CONTAIN}`',
  },
  {
    label: 'the navbar nav keeps its own label when the caller names it, so two navs on a page share one name',
    file: LINKS,
    from: 'aria-label={named ? ariaLabel : labels.navbar.label}',
    to: 'aria-label={labels.navbar.label}',
  },
  {
    label: 'the navbar nav is named in English whatever labels it is given',
    file: LINKS,
    from: 'aria-label={named ? ariaLabel : labels.navbar.label}',
    to: 'aria-label={named ? ariaLabel : en.navbar.label}',
  },
  {
    label: 'the navbar nav writes its label beside aria-labelledby, a second name for one landmark',
    file: LINKS,
    from: "const named = Boolean(ariaLabel) || Boolean(rest['aria-labelledby'])",
    to: 'const named = Boolean(ariaLabel)',
  },
  {
    label: 'the navbar nav takes an empty aria-label as a name, so the landmark has none',
    file: LINKS,
    from: "const named = Boolean(ariaLabel) || Boolean(rest['aria-labelledby'])",
    to: "const named = ariaLabel !== undefined || Boolean(rest['aria-labelledby'])",
  },
  {
    label: 'the navbar list loses role="list", which Safari drops with the list style',
    file: LINKS,
    from: '<ul role="list" className={NAVBAR_LIST}>',
    to: '<ul className={NAVBAR_LIST}>',
  },
  {
    label: 'the navbar nav lets locale through to the element as an unknown attribute',
    file: LINKS,
    from: '  locale: _locale,\n',
    to: '',
  },
  {
    label: 'the navbar nav passes className first, so the consumer loses every conflict',
    file: LINKS,
    from: 'className={cn(NAVBAR_LINKS, className)}',
    to: 'className={cn(className, NAVBAR_LINKS)}',
  },
  // A link.
  {
    label: 'a current navbar link never says aria-current, so a screen reader is not told which page is open',
    file: LINK,
    from: "    'aria-current': current ? 'page' : undefined,\n",
    to: '',
  },
  {
    label: 'every navbar link says aria-current, so every link is drawn as the page being read',
    file: LINK,
    from: "'aria-current': current ? 'page' : undefined,",
    to: "'aria-current': 'page',",
  },
  {
    label: 'a navbar link is current by default',
    file: CONSTANTS,
    from: '  current: false,',
    to: '  current: true,',
  },
  {
    label: 'the current navbar link is told by its colour alone',
    file: CLASSES,
    from: "'aria-[current=page]:font-semibold aria-[current=page]:text-body ",
    to: "'aria-[current=page]:text-body ",
  },
  {
    label: 'the current navbar link has no underline under forced colours, where every link is one colour',
    file: CLASSES,
    from: ' forced-colors:aria-[current=page]:underline ',
    to: ' ',
  },
  {
    label: 'a navbar list opens at its start, so on a phone the link of the page being read can be out of view',
    file: CLASSES,
    from: ' aria-[current=page]:[scroll-initial-target:nearest]',
    to: '',
  },
  {
    label: 'a navbar link loses its focus ring',
    file: CLASSES,
    from: '  HOVER.link,\n  FOCUS_RING,\n',
    to: '  HOVER.link,\n',
  },
  {
    label: 'a navbar link loses its 24 px and 44 px target',
    file: CLASSES,
    from: '  HOVER.link,\n  FOCUS_RING,\n  TOUCH_TARGET,\n',
    to: '  HOVER.link,\n  FOCUS_RING,\n',
  },
  {
    label: 'a navbar link no longer clips what it holds',
    file: CLASSES,
    from: "'inline-flex items-center justify-center-safe overflow-hidden rounded-control text-sm text-muted'",
    to: "'inline-flex items-center justify-center-safe rounded-control text-sm text-muted'",
  },
  {
    label: 'a navbar link ignores its render element, so a framework link is replaced by a plain anchor',
    file: LINK,
    from: 'return renderElement(render ?? <a />, {',
    to: 'return renderElement(<a />, {',
  },
  {
    label: 'a navbar link passes className first, so the consumer loses every conflict',
    file: LINK,
    from: 'className: cn(NAVBAR_LINK, className),',
    to: 'className: cn(className, NAVBAR_LINK),',
  },
  {
    label: 'a navbar link drops the rest props, so its href never reaches the anchor',
    file: LINK,
    from: '    ...rest,\n',
    to: '',
  },
  {
    label: 'the navbar list puts its links straight in the ul, so the list holds no list item',
    file: LINKS,
    from: '        {Children.toArray(children).map((child, index) => (\n          <li key={isValidElement(child) ? child.key : index} className={NAVBAR_ITEM}>{child}</li>\n        ))}',
    to: '        {children}',
  },
  {
    label: 'a navbar link no longer bounds its label, so a pasted paragraph is rendered whole',
    file: LINK,
    from: '    children: truncateLabel(children, NAVBAR_BOUNDARIES.labelMaxLength),\n    ...rest,',
    to: '    children,\n    ...rest,',
  },
  {
    label: 'the navbar label bound is 1,000 characters, ten times the guard rail',
    file: 'src/components/navbar/boundaries.ts',
    from: '  labelMaxLength: 100,',
    to: '  labelMaxLength: 1000,',
  },
  // The actions, the exports and the catalog row.
  {
    label: 'the navbar actions are no longer pushed to the end of the bar',
    file: CLASSES,
    from: 'export const NAVBAR_ACTIONS = `ms-auto flex flex-wrap items-center justify-end gap-2 ${CONTAIN}`',
    to: 'export const NAVBAR_ACTIONS = `flex flex-wrap items-center justify-end gap-2 ${CONTAIN}`',
  },
  {
    label: 'the navbar actions can grow wider than the bar',
    file: CLASSES,
    from: 'export const NAVBAR_ACTIONS = `ms-auto flex flex-wrap items-center justify-end gap-2 ${CONTAIN}`',
    to: "export const NAVBAR_ACTIONS = 'ms-auto flex flex-wrap items-center justify-end gap-2'",
  },
  {
    label: 'the navbar index exports NavbarOffset, a client part no caller should mount',
    file: 'src/components/navbar/index.tsx',
    from: "export { NavbarActions } from './parts/navbar-actions.js'\n",
    to: "export { NavbarActions } from './parts/navbar-actions.js'\nexport { NavbarOffset } from './client.js'\n",
  },
  {
    label: 'the navbar meta row says it renders on the server, while its folder holds a client part',
    file: 'src/components/navbar/meta.ts',
    from: "  rendering: 'split',",
    to: "  rendering: 'server',",
  },
  {
    label: 'the navbar schema loses the description of sticky, so the props table prints an empty cell',
    file: 'src/components/navbar/schema.ts',
    from: "    .meta({ description: 'NavbarRoot: the bar stays at the top while the page scrolls, and publishes its height as --tc-sticky-top.' }),",
    to: "    .meta({ description: '' }),",
  },
  {
    label: 'the transparent navbar keeps the raised surface, so the look Figma 138:2393 draws on the page is a solid bar',
    file: 'src/components/navbar/classes.ts',
    from: "  transparent: 'border-transparent',",
    to: "  transparent: 'bg-surface-raised border-line',",
  },
  {
    label: 'the navbar never marks the page scrolled under it, so the solid bar never takes its shadow',
    file: 'src/components/navbar/hook.ts',
    from: "bar.toggleAttribute('data-scrolled', view.scrollY > 0)",
    to: "bar.toggleAttribute('data-scrolled', false)",
  },
  {
    label: 'the navbar keeps its scrolled mark after it unmounts',
    file: 'src/components/navbar/hook.ts',
    from: "      bar.removeAttribute('data-scrolled')\n",
    to: '',
  },
]
