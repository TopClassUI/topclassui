// The mutations of the isolation root TopClassProvider renders. Found by scripts/mutations/index.ts.
// Every label holds "isolation root", the word to filter them by. Paint order itself is in e2e/provider.spec.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the isolation root gets contents back, so it has no box and a page z-index climbs over every overlay',
    file: 'src/shared/provider/provider.tsx',
    from: "nested ? 'contents' : 'isolate'",
    to: "nested ? 'contents' : 'isolate contents'",
  },
  {
    label: 'the isolation root stops isolating: a plain div, which any z-index of the page escapes',
    file: 'src/shared/provider/provider.tsx',
    from: "nested ? 'contents' : 'isolate'",
    to: "nested ? 'contents' : 'block'",
  },
  {
    label: 'a nested provider becomes an isolation root of its own, a box an island never had inside the page',
    file: 'src/shared/provider/provider.tsx',
    from: "nested ? 'contents' : 'isolate'",
    to: "'isolate'",
  },
  {
    label: 'the isolation root drops the className of the provider, so the layout a body held cannot reach the app',
    file: 'src/shared/provider/provider.tsx',
    from: "cn(nested ? 'contents' : 'isolate', className)",
    to: "cn(nested ? 'contents' : 'isolate')",
  },
  {
    label: 'the class of the isolation root beats the className of the provider, so an island can never be given a box',
    file: 'src/shared/provider/provider.tsx',
    from: "cn(nested ? 'contents' : 'isolate', className)",
    to: "cn(className, nested ? 'contents' : 'isolate')",
  },
]
