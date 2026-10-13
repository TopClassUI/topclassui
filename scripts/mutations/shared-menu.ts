// The mutations of src/shared/contracts/menu.ts. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the menu item tone list gains primary, so a menu row may take a tone the menu has no look for',
    file: 'src/shared/contracts/menu.ts',
    from: "['neutral', 'danger'] as const",
    to: "['neutral', 'danger', 'primary'] as const",
  },
  {
    label: 'a menu item that is a link may also carry onSelect, so one row has two things to do',
    file: 'src/shared/contracts/menu.ts',
    from: '  href: string\n  action?: undefined\n  onSelect?: undefined\n',
    to: '  href: string\n  action?: undefined\n',
  },
  {
    label: 'a menu item compiles with no href, action or onSelect, so a row does nothing when chosen',
    file: 'src/shared/contracts/menu.ts',
    from: '  onSelect: () => void\n',
    to: '  onSelect?: (() => void) | undefined\n',
  },
]
