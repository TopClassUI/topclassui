import type { MDXComponents } from 'mdx/types'

/** Required by @next/mdx; the pages pass their locale's map as `components`, so nothing is global here. */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components
}
