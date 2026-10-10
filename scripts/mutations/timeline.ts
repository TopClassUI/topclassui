// The mutations of src/components/timeline. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the timeline draws a connector under its last item, a rail that leads to nothing',
    file: 'src/components/timeline/index.tsx',
    from: '{index === last ? null : <span className={TIMELINE_CONNECTOR} />}',
    to: '<span className={TIMELINE_CONNECTOR} />',
  },
  {
    label: 'the timeline marks every item that has a status as the current step, not only the current one',
    file: 'src/components/timeline/index.tsx',
    from: "aria-current={item.status === 'current' ? 'step' : undefined}",
    to: "aria-current={item.status ? 'step' : undefined}",
  },
  {
    label: 'the timeline connector loses its border, so forced colours repaint the rail to nothing',
    file: 'src/components/timeline/classes.ts',
    from: "'block w-0.5 flex-1 bg-line border-s-(length:--tc-line-width) border-transparent'",
    to: "'block w-0.5 flex-1 bg-line'",
  },
  {
    label: 'the timeline renders an empty list for no items, and never its emptyFallback',
    file: 'src/components/timeline/index.tsx',
    from: '  if (items.length === 0) return emptyFallback ?? null\n',
    to: '',
  },
  {
    label: 'the timeline fills the marker of a todo item, so todo and done read the same',
    file: 'src/components/timeline/index.tsx',
    from: "const hollow = item.status === 'todo'",
    to: 'const hollow = false',
  },
  {
    label: 'the timeline keys its items by index, so a reordered list repaints rows instead of moving them',
    file: 'src/components/timeline/index.tsx',
    from: 'key={getKey(item)}',
    to: 'key={index}',
  },
  {
    label: 'the timeline wraps its title in a paragraph again, so block content in a title is a p inside a p and hydration fails',
    file: 'src/components/timeline/index.tsx',
    from: '<div className={TIMELINE_TITLE}>{item.title}</div>',
    to: '<p className={TIMELINE_TITLE}>{item.title}</p>',
  },
  {
    label: 'the timeline drops its hidden status text, so a screen reader hears nothing for a done or a todo item',
    file: 'src/components/timeline/index.tsx',
    from: '{spoken === null ? null : <span className="sr-only">{spoken}</span>}',
    to: '',
  },
  {
    label: 'the timeline draws its current marker as a done one, so the two differ by hue alone',
    file: 'src/components/timeline/index.tsx',
    from: "const dot = item.status === 'current' ? TIMELINE_DOT_CURRENT[tone] : TIMELINE_DOT[tone]",
    to: 'const dot = TIMELINE_DOT[tone]',
  },
  {
    label: 'a filled timeline dot loses its stroke, so the amber one is 2.13:1 against a white page',
    file: 'src/components/timeline/classes.ts',
    from: 'const FILLED = `${DOT} ${BORDER_STRONG} forced-color-adjust-none`',
    to: 'const FILLED = `${DOT} forced-color-adjust-none`',
  },
  {
    label: 'a filled timeline dot keeps its theme colour under forced colours, so a neutral one matches an opposite canvas',
    file: 'src/components/timeline/classes.ts',
    from: "const FORCED = 'forced-colors:border-[CanvasText] forced-colors:bg-[CanvasText]'",
    to: "const FORCED = ''",
  },
  {
    label: 'the timeline renders an empty element for an empty-string time, a 2 px gap under the title',
    file: 'src/components/timeline/index.tsx',
    from: '{isBlank(item.time) ? null : <div className={TIMELINE_TIME}>{item.time}</div>}',
    to: '{item.time == null ? null : <div className={TIMELINE_TIME}>{item.time}</div>}',
  },
  {
    label: 'the timeline title loses its one-line floor, so an empty title leaves the connector no height',
    file: 'src/components/timeline/classes.ts',
    from: "export const TIMELINE_TITLE = 'min-h-5 text-sm font-medium text-body'",
    to: "export const TIMELINE_TITLE = 'text-sm font-medium text-body'",
  },
  {
    label: 'the timeline forwards locale to its list again, so a spread of getLabels writes an attribute HTML does not have',
    file: 'src/components/timeline/index.tsx',
    from: '  locale: _locale,\n',
    to: '',
  },
]
