// Plan 3.3: the four edits a copied file gets. Nothing else changes, so `diff` compares like with like.
import type { Framework } from './detect.js'
import { rewriteSpecifiers } from './specifiers.js'
import type { ModuleResolution } from './tsconfig.js'

export interface RewriteOptions {
  framework: Framework
  moduleResolution: Exclude<ModuleResolution, 'other'>
  /** How the app imports the copied folder: `@/topclassui` with an alias, else `./src/topclassui`. */
  importBase: string
}

const USE_CLIENT = /^(['"])use client\1;?[ \t]*\r?\n(?:[ \t]*\r?\n)?/

/** The text written to `<folder>/<path>` for the library's source of that path. */
export function rewriteFile(path: string, content: string, options: RewriteOptions): string {
  if (!/\.tsx?$/.test(path)) return content
  let code = rewriteSpecifiers(path, content, { stripJs: options.moduleResolution === 'bundler' }).code
  // Vite has no server components, so the directive only earns a bundler warning there.
  if (options.framework === 'vite-react') code = code.replace(USE_CLIENT, '')
  return code.replaceAll(`'topclassui/icons/`, `'${options.importBase}/icons/data/`)
}
