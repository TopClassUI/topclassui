// The mutations of the R-13-1 warning TopClassProvider gives a layout that left out direction or locale.
// Found by scripts/mutations/index.ts. Every label holds "provider warning", the words to filter them by.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the provider warning is gone, so a layout without direction falls back to left to right in silence',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: '    for (const prop of missing) warned.add(prop)\n    console.warn(',
    to: '    for (const prop of missing) warned.add(prop)\n    void (',
  },
  {
    label: 'the provider warning forgets what it said, so every provider and every render warns again',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: '    for (const prop of missing) warned.add(prop)\n',
    to: '',
  },
  {
    label: 'the provider warning also fires in a production build',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: "    if (process.env.NODE_ENV === 'production') return\n",
    to: '',
  },
  {
    label: 'the provider warning reads NODE_ENV in bracket form, which no bundler inlines, so the provider throws in the browser',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: "    if (process.env.NODE_ENV === 'production') return\n",
    to: "    if (process.env['NODE_ENV'] === 'production') return\n",
  },
  {
    label: 'the provider warning runs during render, so a server render warns too',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: '  useEffect(() => {\n',
    to: '  ;((run: () => void, _deps: unknown[]) => run())(() => {\n',
  },
  {
    label: 'the provider warning accepts any direction, so "auto" reaches Base UI and the context',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: "  const validDirection = direction === 'ltr' || direction === 'rtl'\n",
    to: '  const validDirection = direction !== undefined\n',
  },
  {
    label: 'the provider warning passes an undefined locale on to the context instead of the fallback',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: '    locale: validLocale ? locale : FALLBACK_CONTEXT.locale,\n',
    to: '    locale: locale as string,\n',
  },
]
