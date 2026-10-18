// The shape of dist/registry/: one shadcn-style item per component, the base item, the icon data
// and the index the resolver and `list` read. Written by scripts/registry-build.ts, read by the CLI.
export const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'

/** The item every project gets from `init`: shared/, the icon runtime, tokens.css and styles.css. */
export const BASE = 'base'

export interface RegistryFile {
  /** Relative to the copied folder, POSIX, such as `components/dialog/client.tsx`. */
  path: string
  type: 'registry:file'
  target: string
  /** The library's source before the copy-time rewrite, `#shared/` specifiers intact. */
  content: string
}

export interface Example {
  /** The other components the demo imports; it is copied only when all of them are present. */
  components: string[]
  icons: string[]
}

export interface RegistryItem {
  $schema: string
  name: string
  type: 'registry:ui' | 'registry:base'
  title: string
  dependencies: string[]
  registryDependencies: string[]
  files: RegistryFile[]
  meta: {
    topclassui: {
      version: string
      icons: string[]
      examples: Record<string, Example>
      client: string[]
    }
  }
}

export interface IndexEntry {
  name: string
  type: RegistryItem['type']
  title: string
  registryDependencies: string[]
  /** npm package names; the ranges are the library's own, in `RegistryIndex.packages`. */
  dependencies: string[]
  icons: string[]
  files: string[]
}

export interface RegistryIndex {
  version: string
  packages: Record<string, string>
  items: IndexEntry[]
}

/** The icon data files, keyed by icon name, so `add` copies only the icons a component imports. */
export type IconData = Record<string, string>

export const iconPath = (name: string): string => `icons/data/${name}.ts`

/** `@base-ui/react@1.8.0`, the form a registry item lists and a package manager accepts. */
export const withRange = (name: string, packages: Record<string, string>): string =>
  packages[name] === undefined ? name : `${name}@${packages[name]}`
