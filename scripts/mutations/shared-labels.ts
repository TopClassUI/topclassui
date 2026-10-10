// The mutations of the labels Unit 3 added to src/shared/labels. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'a drawer label override is dropped on the way through getLabels, so a caller cannot reword the close button',
    file: 'src/shared/labels/get-labels.ts',
    from: '    drawer: group(base.drawer, overrides.drawer),',
    to: '    drawer: base.drawer,',
  },
  {
    label: 'a toast label override is dropped on the way through getLabels, so a caller cannot reword the close button',
    file: 'src/shared/labels/get-labels.ts',
    from: '    toast: group(base.toast, overrides.toast),',
    to: '    toast: base.toast,',
  },
  {
    label: 'a command label override is dropped on the way through getLabels, so a caller cannot reword the placeholder',
    file: 'src/shared/labels/get-labels.ts',
    from: '    command: group(base.command, overrides.command),',
    to: '    command: base.command,',
  },
  {
    label: 'a navbar label override is dropped on the way through getLabels, so two navs on a page share one name',
    file: 'src/shared/labels/get-labels.ts',
    from: '    navbar: group(base.navbar, overrides.navbar),',
    to: '    navbar: base.navbar,',
  },
  {
    label: 'a sidebar label override is dropped on the way through getLabels, so a caller cannot reword the collapse button',
    file: 'src/shared/labels/get-labels.ts',
    from: '    sidebar: group(base.sidebar, overrides.sidebar),',
    to: '    sidebar: base.sidebar,',
  },
  {
    label: 'a tag label override is dropped on the way through getLabels, so a caller cannot reword the remove button',
    file: 'src/shared/labels/get-labels.ts',
    from: '    tag: group(base.tag, overrides.tag),',
    to: '    tag: base.tag,',
  },
  {
    label: 'a banner label override is dropped on the way through getLabels, so a caller cannot reword the dismiss button',
    file: 'src/shared/labels/get-labels.ts',
    from: '    banner: group(base.banner, overrides.banner),',
    to: '    banner: base.banner,',
  },
  {
    label: 'the rating stars label loses its singular, so the first star of a rating is announced as 1 stars',
    file: 'src/shared/labels/en.ts',
    from: "(n === 1 ? '1 star' : `${fmt.format(n)} stars`)",
    to: '`${fmt.format(n)} stars`',
  },
]
