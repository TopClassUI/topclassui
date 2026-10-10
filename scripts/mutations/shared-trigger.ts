// The mutations of what the overlays share: the trigger helper, the scroll tab stop and the scroll area. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'renderTrigger hands the className back after merging it into the element, so Base UI writes the class a second time',
    file: 'src/shared/render-trigger.ts',
    from: 'className: undefined }',
    to: 'className }',
  },
  {
    label: 'renderTrigger copies a render element it has nothing to change on, so a lazy wrapper is unwrapped and rebuilt on every render',
    file: 'src/shared/render-trigger.ts',
    from: 'if (!own || (className === undefined && !bare)) return { render, className }',
    to: 'if (!own) return { render, className }',
  },
  {
    label: 'renderTrigger stops looking for a children key that holds nothing, so a label left on a trigger is erased by its render element',
    file: 'src/shared/render-trigger.ts',
    from: "const bare = own !== undefined && 'children' in own.props && own.props.children === undefined",
    to: 'const bare = false',
  },
  {
    label: 'renderTrigger takes every render element for one with no children, so a Button loses the label it was written with',
    file: 'src/shared/render-trigger.ts',
    from: ' && own.props.children === undefined',
    to: '',
  },
  {
    label: 'useScrollTabStop measures one axis only, so a box that scrolls sideways is never a tab stop',
    file: 'src/shared/use-scroll-tab-stop.ts',
    from: ' || element.scrollWidth - element.clientWidth > SLACK',
    to: '',
  },
  {
    label: 'useScrollTabStop takes the tab stop from under the focus when the content shrinks, so the focus falls to the body',
    file: 'src/shared/use-scroll-tab-stop.ts',
    from: 'setScrolls(overflows || element.ownerDocument.activeElement === element)',
    to: 'setScrolls(overflows)',
  },
  {
    label: 'useScrollTabStop starts as a tab stop, so the server writes a tabindex on a box nothing has measured',
    file: 'src/shared/use-scroll-tab-stop.ts',
    from: 'useState(false)',
    to: 'useState(true)',
  },
  {
    label: 'useScrollTabStop watches the box alone, so content that grows inside a child is never heard',
    file: 'src/shared/use-scroll-tab-stop.ts',
    from: '    for (const child of element.children) sizes.observe(child)\n',
    to: '',
  },
  {
    label: 'useScrollTabStop stops listening for rows that arrive or leave, so a list that fills up later stays out of the tab order',
    file: 'src/shared/use-scroll-tab-stop.ts',
    from: '    content.observe(element, { childList: true, characterData: true, subtree: true })\n',
    to: '',
  },
  {
    label: 'the shared scroll area loses its scroll padding, so the ring of a control that Tab brings into view is cut at the edge',
    file: 'src/shared/classes.ts',
    from: " scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]'",
    to: "'",
  },
]
