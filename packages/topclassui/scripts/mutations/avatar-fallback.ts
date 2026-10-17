// The mutations of the client half of src/components/avatar. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const HOOK = 'src/components/avatar/hook.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the avatar fallback check on mount is removed, so a picture that failed before hydration keeps its broken mark',
    file: HOOK,
    from: '    if (!node?.complete || node.naturalWidth > 0) return\n',
    to: '    return\n',
  },
  {
    label: 'the avatar fallback check on mount asks decode() of every picture still loading: Chromium waits, so no fault shows, only work',
    file: HOOK,
    from: 'if (!node?.complete || node.naturalWidth > 0) return',
    to: 'if (!node || node.naturalWidth > 0) return',
  },
  {
    label: 'the avatar fallback trusts a 0 px width alone, so a picture that decodes is hidden too',
    file: HOOK,
    from: '    node.decode().catch(() => {',
    to: '    Promise.reject(new Error()).catch(() => {',
  },
  {
    label: "the avatar fallback marks a picture that failed before hydration but never tells the caller's onError",
    file: HOOK,
    from: "if (same && !heard.current) node.dispatchEvent(new Event('error'))",
    to: 'if (same && !heard.current) settle(true)',
  },
  {
    label: "the avatar fallback replays an error the img already reported, so the caller's onError runs twice",
    file: HOOK,
    from: 'if (same && !heard.current)',
    to: 'if (same)',
  },
  {
    label: 'the avatar fallback keeps a failure across a new src, so a good picture after a bad one stays hidden',
    file: HOOK,
    from: '  if (!Object.is(state.src, src) || !Object.is(state.srcSet, srcSet)) setState({ src, srcSet, broken: false })\n',
    to: '',
  },
  {
    label: 'the avatar fallback keeps a failure across a new srcSet, so a picture given by srcSet alone stays hidden',
    file: HOOK,
    from: '  if (!Object.is(state.src, src) || !Object.is(state.srcSet, srcSet)) setState(',
    to: '  if (!Object.is(state.src, src)) setState(',
  },
  {
    label: 'the avatar fallback ignores a load, so another srcset candidate that loads after one failed stays hidden',
    file: HOOK,
    from: '    settle(false)\n',
    to: '',
  },
  {
    label: "the avatar fallback swallows the caller's onError",
    file: HOOK,
    from: '    onError?.(event)\n',
    to: '',
  },
  {
    label: "the avatar fallback swallows the caller's onLoad",
    file: HOOK,
    from: '    onLoad?.(event)\n',
    to: '',
  },
  {
    label: "the avatar fallback drops the caller's ref to the img",
    file: HOOK,
    from: "    if (forwarded && typeof forwarded === 'object') forwarded.current = node\n",
    to: '',
  },
  {
    label: "the avatar fallback makes a new ref each render, so the caller's callback ref is detached and attached again on every failure",
    file: HOOK,
    from: '  }, [forwarded])',
    to: '  }, [forwarded, state])',
  },
  {
    label: "the avatar fallback never runs the cleanup the caller's callback ref returned",
    file: HOOK,
    from: "      if (typeof done === 'function') done()\n      else ",
    to: '      ',
  },
  {
    label: 'the avatar fallback never marks a failed picture, so its broken mark sits over the initials',
    file: 'src/components/avatar/client.tsx',
    from: "'data-error': image.failed ? '' : undefined,",
    to: "'data-error': undefined,",
  },
  {
    label: 'the avatar fallback reads its source without the render element, so next/image never starts again on a new src',
    file: 'src/components/avatar/client.tsx',
    from: 'readSource(rest, render)',
    to: 'readSource(rest, undefined)',
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
    from: "  if (typeof own !== 'object' || own === null || !(key in own)) return given\n",
    to: '  return given\n',
  },
  {
    label: 'the avatar fallback lets the src the part was given win over the render element, which renderElement does not',
    file: 'src/components/avatar/lib.ts',
    from: '  return value === undefined ? given : value\n',
    to: '  return given === undefined ? value : given\n',
  },
]
