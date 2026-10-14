// The mutations of the client half of src/components/avatar. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the avatar fallback check on mount is removed, so a picture that failed before hydration keeps its broken mark',
    file: 'src/components/avatar/hook.ts',
    from: '    image.decode().catch(fail)',
    to: '    void fail',
  },
  {
    label: 'the avatar fallback check on mount marks an image still loading, so a slow picture never shows',
    file: 'src/components/avatar/hook.ts',
    from: 'if (!image?.complete || image.naturalWidth > 0) return',
    to: 'if (!image || image.naturalWidth > 0) return',
  },
  {
    label: 'the avatar fallback trusts a 0 px width alone, so a picture that decodes is hidden too',
    file: 'src/components/avatar/hook.ts',
    from: '    image.decode().catch(fail)',
    to: '    fail()',
  },
  {
    label: 'the avatar fallback keeps a failure across a new src, so a good picture after a bad one stays hidden',
    file: 'src/components/avatar/hook.ts',
    from: '  if (!Object.is(state.src, src)) setState({ src, broken: false })',
    to: '',
  },
  {
    label: "the avatar fallback swallows the caller's onError",
    file: 'src/components/avatar/hook.ts',
    from: '    onError?.(event)\n',
    to: '',
  },
  {
    label: "the avatar fallback drops the caller's ref to the img",
    file: 'src/components/avatar/hook.ts',
    from: '  useImperativeHandle(forwarded, () => ref.current as HTMLImageElement)\n',
    to: '',
  },
  {
    label: 'the avatar fallback never marks a failed picture, so its broken mark sits over the initials',
    file: 'src/components/avatar/client.tsx',
    from: "'data-error': image.failed ? '' : undefined,",
    to: "'data-error': undefined,",
  },
  {
    label: 'the avatar fallback marks a failed picture but no class hides it',
    file: 'src/components/avatar/classes.ts',
    from: "  'data-error:opacity-0',",
    to: "  '',",
  },
  {
    label: 'the avatar fallback removes a failed picture instead of hiding it, so its alt no longer names the avatar',
    file: 'src/components/avatar/classes.ts',
    from: "  'data-error:opacity-0',",
    to: "  'data-error:hidden',",
  },
  {
    label: 'the avatar fallback reads no src off a render element, so next/image never starts again on a new one',
    file: 'src/components/avatar/lib.ts',
    from: "  if (src !== undefined || render === undefined) return src\n",
    to: '  return src\n',
  },
]
