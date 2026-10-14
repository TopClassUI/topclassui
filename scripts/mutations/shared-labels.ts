// The mutations of the labels Units 3 and 4 added to src/shared/labels. Found by scripts/mutations/index.ts.
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
  {
    label: 'unit 4: a numberfield label override is dropped on the way through getLabels, so a caller cannot reword a stepper',
    file: 'src/shared/labels/get-labels.ts',
    from: '    numberField: group(base.numberField, overrides.numberField),',
    to: '    numberField: base.numberField,',
  },
  {
    label: 'unit 4: a slider label override is dropped on the way through getLabels, so a caller cannot rename a thumb',
    file: 'src/shared/labels/get-labels.ts',
    from: '    slider: group(base.slider, overrides.slider),',
    to: '    slider: base.slider,',
  },
  {
    label: 'unit 4: an otp label override is dropped on the way through getLabels, so a caller cannot rename a cell',
    file: 'src/shared/labels/get-labels.ts',
    from: '    otp: group(base.otp, overrides.otp),',
    to: '    otp: base.otp,',
  },
  {
    label: 'unit 4: a textarea label override is dropped on the way through getLabels, so a caller cannot reword the count',
    file: 'src/shared/labels/get-labels.ts',
    from: '    textarea: group(base.textarea, overrides.textarea),',
    to: '    textarea: base.textarea,',
  },
  {
    label: 'unit 4: the otp cell label skips the formatter for its place, so an Arabic page reads a Latin digit',
    file: 'src/shared/labels/en.ts',
    from: '`Character ${fmt.format(place)} of',
    to: '`Character ${String(place)} of',
  },
  {
    label: 'unit 4: the textarea count skips the formatter for its cap, so 5000 loses its separator',
    file: 'src/shared/labels/en.ts',
    from: 'of ${fmt.format(max)} characters`',
    to: 'of ${String(max)} characters`',
  },
  {
    label: 'unit 4: the Arabic textarea count reads the cap before the length',
    file: 'src/shared/labels/ar.ts',
    from: '`عدد الأحرف: ${fmt.format(length)} من ${fmt.format(max)}`',
    to: '`عدد الأحرف: ${fmt.format(max)} من ${fmt.format(length)}`',
  },
]
