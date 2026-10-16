// The mutations of src/components/code-block. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const INDEX = 'src/components/code-block/index.tsx'
const CLIENT = 'src/components/code-block/client.tsx'
const HOOK = 'src/components/code-block/hook.ts'
const CLASSES = 'src/components/code-block/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the code block pre loses dir="ltr", so code reads right to left in an Arabic page',
    file: INDEX,
    from: '        dir="ltr"\n',
    to: '',
  },
  {
    label: 'the code block button takes the copied text as its name after a press',
    file: CLIENT,
    from: 'aria-label={label}',
    to: "aria-label={button.result === 'copied' ? copied : label}",
  },
  {
    label: 'the code block root loses --tc-ring, so both rings draw the page ring colour on the block',
    file: CLASSES,
    from: ' [--tc-ring:var(--tc-neutral-on-solid)]',
    to: '',
  },
  {
    label: 'the code block pre loses translate="no", so a page translator rewrites the code',
    file: INDEX,
    from: '        translate="no"\n',
    to: '',
  },
  {
    label: 'the code block pre is a tab stop with wrap too',
    file: INDEX,
    from: 'tabIndex={wrap ? undefined : 0}',
    to: 'tabIndex={0}',
  },
  {
    label: 'the code block pre is never a region, so the title names nothing',
    file: INDEX,
    from: "role={named || !wrap ? 'region' : undefined}",
    to: 'role={undefined}',
  },
  {
    label: 'the code block pre with no title is a tab stop with no role, so Tab lands on a nameless box',
    file: INDEX,
    from: "role={named || !wrap ? 'region' : undefined}",
    to: "role={named ? 'region' : undefined}",
  },
  {
    label: 'the code block pre with no title takes no name from labels',
    file: INDEX,
    from: 'aria-label={named || wrap ? undefined : labels.common.code}',
    to: 'aria-label={undefined}',
  },
  {
    label: 'the code block button gets no title id, so five buttons on a page all read "Copy"',
    file: INDEX,
    from: 'titleId={named ? titleId : undefined}',
    to: 'titleId={undefined}',
  },
  {
    label: 'the code block ignores highlighted and renders the plain text',
    file: INDEX,
    from: '{hasContent(highlighted) ? highlighted : children}',
    to: '{children}',
  },
  {
    label: 'the code block renders the button with a title and showCopy={false}, so a plain block ships script',
    file: INDEX,
    from: '          {showCopy ? (',
    to: '          {showCopy || named ? (',
  },
  {
    label: 'the code block button says the copied word when the copy fails',
    file: INDEX,
    from: 'failed={labels.common.copyFailed}',
    to: 'failed={labels.common.copied}',
  },
  {
    label: 'the code block button loses type="button", so inside a form it submits the form',
    file: CLIENT,
    from: '        type="button"\n',
    to: '',
  },
  {
    label: 'the code block button keeps the copy icon after a copy, so the eye gets no cue',
    file: CLIENT,
    from: "button.result === 'copied' ? check : copy",
    to: 'copy',
  },
  {
    label: 'the code block button loses data-copied',
    file: CLIENT,
    from: "data-copied={button.result === 'copied' ? '' : undefined}",
    to: 'data-copied={undefined}',
  },
  {
    label: 'the code block treats a missing clipboard as a copy, so plain http says Copied',
    file: HOOK,
    from: "let next: CopyResult = 'failed'",
    to: "let next: CopyResult = 'copied'",
  },
  {
    label: 'the code block treats a refused write as a copy',
    file: HOOK,
    from: "    } catch {\n      next = 'failed'\n    }",
    to: "    } catch {\n      next = 'copied'\n    }",
  },
  {
    label: 'the code block never clears its status, so the next copy is not announced',
    file: HOOK,
    from: "    timer.current = window.setTimeout(() => { setResult('idle') }, COPY_RESET_MS)\n",
    to: '',
  },
  {
    label: 'the code block does not empty its status before a second press',
    file: HOOK,
    from: "    setResult('idle')\n    setPresses",
    to: '    setPresses',
  },
  {
    label: 'the code block status keeps one node for its words, so a repeat failed press changes nothing a screen reader hears',
    file: CLIENT,
    from: '<span key={button.presses}>',
    to: '<span>',
  },
  {
    label: 'the code block leaves its timer running after unmount',
    file: HOOK,
    from: 'useEffect(() => () => { window.clearTimeout(timer.current) }, [])',
    to: 'useEffect(() => undefined, [])',
  },
  {
    label: 'the code block pre stops scrolling sideways, so a long line widens the page',
    file: CLASSES,
    from: '${FOCUS_RING_INSET} ${SCROLL_X}`',
    to: '${FOCUS_RING_INSET}`',
  },
  {
    label: 'the code block root loses its one column, so a long line widens a grid or flex parent',
    file: CLASSES,
    from: 'relative grid min-w-0 grid-cols-1 rounded-box',
    to: 'relative grid rounded-box',
  },
  {
    label: 'the code block root loses its forced-colours edge',
    file: CLASSES,
    from: ' ${CONTAIN} ${FORCED_EDGE}`',
    to: ' ${CONTAIN}`',
  },
  {
    label: 'the code block pre alone keeps the header shape: no top padding, square top corners',
    file: CLASSES,
    from: "export const CODE_BLOCK_PRE_ALONE = 'rounded-box pt-3.5'",
    to: "export const CODE_BLOCK_PRE_ALONE = ''",
  },
  {
    label: 'the code block status becomes visible text',
    file: CLASSES,
    from: "export const CODE_BLOCK_STATUS = 'sr-only'",
    to: "export const CODE_BLOCK_STATUS = ''",
  },
]
