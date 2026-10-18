// S13 step 3: the fences marked `check` in a guide page's MDX, compiled against the package as a reader would paste them.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import ts from 'typescript'

export interface Sample {
  file: string
  index: number
  lang: string
  /** The fence's `title`, so samples of one page import each other by relative path. */
  title: string | null
  code: string
}

/** Short stubs a sample may lean on, so it can stay short (docs-site S13). */
export const PREAMBLE = [
  "import type * as React from 'react'",
  'declare const saveSubscriber: (email: string) => Promise<void>',
  'declare const cities: readonly { id: string; name: string }[]',
  'declare const items: readonly { id: string; label: string }[]',
].join('\n')

/** Every ```ts or ```tsx fence whose info string carries `check`. */
export function checkedSamples(file: string, mdx: string): Sample[] {
  const samples: Sample[] = []
  const fence = /^```(tsx?)([^\n]*)\n([\s\S]*?)^```/gm
  let index = 0
  for (const match of mdx.matchAll(fence)) {
    const [, lang = 'ts', meta = '', code = ''] = match
    if (!/(^|\s)check(\s|$)/.test(meta.replace(/title="[^"]*"/, ''))) continue
    samples.push({ file, index: index++, lang, title: /title="([^"]+)"/.exec(meta)?.[1] ?? null, code })
  }
  return samples
}

const pathOf = (app: string, sample: Sample) =>
  join(app, '.samples', sample.file.replace(/\.mdx$/, ''), sample.title ?? `sample-${String(sample.index)}.${sample.lang}`)

/**
 * The sets of files to compile together. A title shown twice on one page (step 4 rewrites `page.tsx`) is the later file
 * among its neighbours, and each earlier one is compiled again in its place, so no sample is shadowed unchecked.
 */
export function programsOf(app: string, samples: Sample[]): Map<string, string>[] {
  const latest = new Map(samples.map((sample) => [pathOf(app, sample), sample]))
  const shadowed = samples.filter((sample) => latest.get(pathOf(app, sample)) !== sample)
  const files = (chosen: Map<string, Sample>) => new Map([...chosen].map(([path, sample]) => [path, `${PREAMBLE}\n${sample.code}`]))
  return [latest, ...shadowed.map((sample) => new Map(latest).set(pathOf(app, sample), sample))].map(files)
}

function diagnosticsOf(app: string, virtual: Map<string, string>): string[] {
  const configFile = ts.readConfigFile(join(app, 'tsconfig.json'), (path) => ts.sys.readFile(path))
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, app)
  const host = ts.createCompilerHost(parsed.options)
  const readFile = host.readFile.bind(host)
  const fileExists = host.fileExists.bind(host)
  host.readFile = (path) => virtual.get(path) ?? readFile(path)
  host.fileExists = (path) => virtual.has(path) || fileExists(path)
  const directoryExists = host.directoryExists?.bind(host)
  host.directoryExists = (path) => [...virtual.keys()].some((file) => file.startsWith(`${path}/`)) || (directoryExists?.(path) ?? true)
  const program = ts.createProgram([...virtual.keys()], { ...parsed.options, noEmit: true, noUnusedLocals: false, isolatedModules: false }, host)
  return ts.getPreEmitDiagnostics(program)
    .filter((d) => d.file !== undefined && virtual.has(d.file.fileName))
    .map((d) => `${d.file?.fileName ?? ''}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`)
}

/** The diagnostics of each sample, compiled with the app's own tsconfig from inside the app. */
export function compileSamples(app: string, samples: Sample[]): string[] {
  return [...new Set(programsOf(app, samples).flatMap((virtual) => diagnosticsOf(app, virtual)))]
}

export function samplesOf(content: string, pages: readonly string[], locales: readonly string[]): Sample[] {
  return locales.flatMap((locale) => pages.flatMap((page) => {
    const file = `${locale}/${page}.mdx`
    return checkedSamples(file, readFileSync(join(content, file), 'utf8'))
  }))
}
