// INSTALL_LINE: the one install command every line on the site prints (docs-site S8).
import manifest from 'topclassui/package.json' with { type: 'json' }

/** `npm i topclassui@beta zod` while the version carries a prerelease tag, `npm i topclassui zod` after. */
export function installLineOf(version: string): string {
  return version.includes('-') ? 'npm i topclassui@beta zod' : 'npm i topclassui zod'
}

/** The version as the footer and the chip print it: "v0.1.0 beta" for 0.1.0-beta.0. */
export function versionLabelOf(version: string): string {
  const [release = version, pre] = version.split('-')
  const tag = pre?.split('.')[0]
  return tag === undefined ? `v${release}` : `v${release} ${tag}`
}

export const PACKAGE_VERSION: string = manifest.version
export const INSTALL_LINE = installLineOf(PACKAGE_VERSION)

/** The import line of one component, as the install row prints it. */
export function importLineOf(names: readonly string[], slug: string): string {
  return `import { ${names.join(', ')} } from 'topclassui/${slug}'`
}

/** The CLI command that copies one component's source into the app (docs-site.md, the Previewer's install row). */
export const addLineOf = (slug: string): string => `npx topclassui add ${slug}`

/** The import of the copied source, through the `@/topclassui` alias the CLI sets up. */
export function sourceImportLineOf(names: readonly string[], slug: string): string {
  return `import { ${names.join(', ')} } from '@/topclassui/components/${slug}'`
}
