// The mutations of the R-13-1 warnings: a layout that left out direction or locale, no provider at all, and a
// direction that disagrees with <html dir>. Found by scripts/mutations/index.ts. Every label holds "provider warning".
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the provider warning is gone, so a layout without direction falls back to left to right in silence',
    file: 'src/shared/provider/context.ts',
    from: '  for (const kind of fresh) warned.add(kind)\n  console.warn(',
    to: '  for (const kind of fresh) warned.add(kind)\n  void (',
  },
  {
    label: 'the provider warning forgets what it said, so every provider and every render warns again',
    file: 'src/shared/provider/context.ts',
    from: '  for (const kind of fresh) warned.add(kind)\n',
    to: '',
  },
  {
    label: 'the provider warning also fires in a production build',
    file: 'src/shared/provider/context.ts',
    from: "  if (process.env.NODE_ENV === 'production') return\n",
    to: '',
  },
  {
    label: 'the provider warning reads NODE_ENV in bracket form, which no bundler inlines, so the provider throws in the browser',
    file: 'src/shared/provider/context.ts',
    from: "  if (process.env.NODE_ENV === 'production') return\n",
    to: "  if (process.env['NODE_ENV'] === 'production') return\n",
  },
  {
    label: 'the provider warning runs during render, so a server render warns too',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: '  useEffect(() => {\n    const missing',
    to: '  ;((run: () => void, _deps: unknown[]) => run())(() => {\n    const missing',
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
  {
    label: 'the provider warning names both fallbacks when only one prop is missing',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: '      + `${fresh.map(',
    to: '      + `${(["direction", "locale"] as const).map(',
  },
  {
    label: 'the no-provider warning is gone, so an app that mounts no provider runs on the fallback in silence',
    file: 'src/shared/provider/context.ts',
    from: '    if (provided) return\n',
    to: '    return\n',
  },
  {
    label: 'the no-provider warning runs during render, so a server render warns too',
    file: 'src/shared/provider/context.ts',
    from: '  useEffect(() => {\n    if (provided) return\n',
    to: '  ;((run: () => void, _deps: unknown[]) => run())(() => {\n    if (provided) return\n',
  },
  {
    label: 'the no-provider warning skips Switch, which reads no label, so only its hook can notice',
    file: 'src/components/switch/hook.ts',
    from: '  useProviderPresence()\n',
    to: '',
  },
  {
    label: 'the no-provider warning skips Tabs, which reads no label, so only its hook can notice',
    file: 'src/components/tabs/hook.ts',
    from: '  useProviderPresence()\n',
    to: '',
  },
  {
    label: 'the provider warning about <html dir> is gone, so a page whose dir disagrees with the provider is silent',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: "    if (page === '' || page === resolved) return\n",
    to: '    return\n',
  },
  {
    label: 'the provider warning about <html dir> fires for a nested island too, which may differ on purpose',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: '    if (nested) return\n',
    to: '',
  },
  {
    label: 'the provider warning about <html dir> fires when the page sets no dir at all',
    file: 'src/shared/provider/use-provider-locale.ts',
    from: "    if (page === '' || page === resolved) return\n",
    to: '    if (page === resolved) return\n',
  },
]
