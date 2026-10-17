// What the live harness reads out of the source before anything is rendered: the classes a
// stylesheet must already hold when a popup opens, and the packages the browser will ask for.
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { sourceFilesUnder } from './file-sizes.js'
import { buildGraph, packageName } from './module-graph.js'

const QUOTES = new Set(["'", '"', '`'])

/** Where the literal opened at `from` ends: the next quote of its kind that no backslash escapes. */
function closingQuote(source: string, from: number): number {
  for (let i = from + 1; i < source.length; i++) {
    if (source[i] === '\\') i++
    else if (source[i] === source[from]) return i
  }
  return -1
}

/**
 * Every whitespace-separated token of every string literal. Each quote is tried as an
 * opening one, so an apostrophe in a comment costs a few useless tokens and can never
 * hide the string after it; Tailwind drops whatever is not a class.
 */
export function candidatesInSource(source: string): string[] {
  const found = new Set<string>()
  for (let i = 0; i < source.length; i++) {
    if (!QUOTES.has(source[i] ?? '')) continue
    const end = closingQuote(source, i)
    if (end === -1) continue
    const text = source.slice(i + 1, end).replace(/\\(['"`])/g, '$1')
    for (const token of text.split(/\s+/)) if (token) found.add(token)
  }
  return [...found]
}

/** The folders a consumer's Tailwind scans once the CLI has copied a component in. */
export const SOURCE_FOLDERS = ['src/components', 'src/shared'] as const

/** A test names banned classes on purpose, to prove a rule fires, and is never shipped. */
export function isShipped(file: string): boolean {
  const parts = file.split(/[\\/]/)
  return !parts.includes('test') && !/\.test\.tsx?$/.test(file)
}

/** Every shipped .ts and .tsx file of the two folders, as absolute paths. */
export function sourceFiles(root: string): string[] {
  return SOURCE_FOLDERS
    .flatMap((folder) => sourceFilesUnder(join(root, ...folder.split('/'))))
    .filter((file) => isShipped(relative(root, file)))
}

/** The candidates of the whole source, so the classes of a closed popup are compiled too. */
export function sourceCandidates(root: string): string[] {
  const found = new Set<string>()
  for (const file of sourceFiles(root)) {
    for (const candidate of candidatesInSource(readFileSync(file, 'utf8'))) found.add(candidate)
  }
  return [...found]
}

/** The JSX transform imports these two by itself, so no source file names them. */
const JSX_RUNTIMES = ['react/jsx-runtime', 'react/jsx-dev-runtime']

/**
 * The packages reachable from the entries, as written (`@base-ui/react/tooltip`): Vite bundles
 * exactly these before the first page. The import scanner also takes a quoted word after
 * "import" in a demo's prose for a specifier, so only a name installed in node_modules counts.
 */
export function clientPackages(root: string, entries: readonly string[]): string[] {
  // Shipped files only: a test is never reachable from a demo, and reading a thousand of them costs a second.
  const files = [...sourceFilesUnder(join(root, 'src')), ...sourceFilesUnder(join(root, 'scripts', 'lib'))]
    .filter((file) => isShipped(relative(root, file)))
  const graph = buildGraph(files, root)
  const installed = (specifier: string) =>
    /^(@[\w.-]+\/)?[\w.-]+(\/[\w./-]+)?$/.test(specifier)
    && existsSync(join(root, 'node_modules', ...packageName(specifier).split('/'), 'package.json'))

  const found = new Set(JSX_RUNTIMES)
  for (const entry of entries) {
    for (const specifier of graph.specifiers(entry)) if (installed(specifier)) found.add(specifier)
  }
  return [...found].sort()
}
