// The consumer's tsconfig, read by the consumer's own `typescript`, so JSONC, `extends` and `references`
// mean exactly what they mean to the project's compiler.
import { createRequire } from 'node:module'
import { posix } from 'node:path'

import { ancestors, readJson, type Files } from './files.js'
import { toPosix } from './specifiers.js'

export type ModuleResolution = 'bundler' | 'node16' | 'nodenext' | 'other'

export interface TsProject {
  path: string
  moduleResolution: ModuleResolution
  /** `compilerOptions.paths`, with the absolute folder its targets are relative to. */
  paths: Record<string, string[]>
  pathsBase: string
  /** The `include` patterns, relative to the config's folder; `**\/*` when the config has none. */
  include: string[]
  /** Set by `"files": []`, the solution-style root of a Vite template. */
  filesOnly: boolean
  references: string[]
}

export type ReadProject = (configPath: string) => TsProject

interface TypeScriptApi {
  sys: { readFile: (path: string) => string | undefined }
  readConfigFile(path: string, read: (path: string) => string | undefined): { config?: unknown; error?: { messageText: unknown } }
  parseJsonConfigFileContent(
    json: unknown,
    host: unknown,
    basePath: string,
    existing?: undefined,
    configFileName?: string,
  ): {
    options: { paths?: Record<string, string[]>; baseUrl?: string; pathsBasePath?: string }
    raw?: { include?: string[]; files?: string[] }
    projectReferences?: readonly { path: string }[]
  }
  getEmitModuleResolutionKind(options: object): number
  ModuleResolutionKind: Record<string, number | string>
}

/** The project's own `typescript`, resolved from its package.json; null when it is absent or has no JS API (7.x). */
export function loadTypeScript(root: string): TypeScriptApi | null {
  try {
    const ts = createRequire(posix.join(toPosix(root), 'package.json'))('typescript') as Partial<TypeScriptApi>
    return typeof ts.readConfigFile === 'function' && typeof ts.parseJsonConfigFileContent === 'function' ? (ts as TypeScriptApi) : null
  } catch {
    return null
  }
}

function resolutionName(ts: TypeScriptApi, kind: number): ModuleResolution {
  const name = String(ts.ModuleResolutionKind[kind] ?? '').toLowerCase()
  return name === 'bundler' || name === 'node16' || name === 'nodenext' ? name : 'other'
}

export function typescriptReader(ts: TypeScriptApi): ReadProject {
  return (configPath) => {
    const read = ts.readConfigFile(configPath, (p) => ts.sys.readFile(p))
    if (read.error !== undefined) throw new Error(`${configPath}: ${JSON.stringify(read.error.messageText)}`)
    const dir = posix.dirname(toPosix(configPath))
    const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, dir, undefined, configPath)
    const raw = parsed.raw ?? {}
    return {
      path: toPosix(configPath),
      moduleResolution: resolutionName(ts, ts.getEmitModuleResolutionKind(parsed.options)),
      paths: parsed.options.paths ?? {},
      pathsBase: toPosix(parsed.options.baseUrl ?? parsed.options.pathsBasePath ?? dir),
      include: raw.include ?? (raw.files === undefined ? ['**/*'] : []),
      filesOnly: raw.files !== undefined && raw.files.length === 0 && raw.include === undefined,
      references: (parsed.projectReferences ?? []).map((r) => {
        const p = toPosix(r.path)
        return p.endsWith('.json') ? p : posix.join(p, 'tsconfig.json')
      }),
    }
  }
}

/** A tsconfig include pattern as a regular expression over absolute POSIX paths. */
export function includeMatcher(configDir: string, pattern: string): RegExp {
  let p = posix.join(configDir, pattern)
  if (!/[*?]/.test(posix.basename(p)) && posix.extname(p) === '') p = `${p}/**/*`
  const source = p
    .split('/')
    .map((part) =>
      part === '**'
        ? '(?:[^/]+/)*'
        : `${part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]')}/`,
    )
    .join('')
  return new RegExp(`^${source.replace(/\/$/, '')}$`)
}

/** Whether a project's `include` reaches a file, such as `<folder>/components/x.tsx`. */
export function covers(project: TsProject, file: string): boolean {
  if (project.filesOnly) return false
  const dir = posix.dirname(project.path)
  return project.include.some((pattern) => includeMatcher(dir, pattern).test(toPosix(file)))
}

/** JSON with comments and trailing commas, as tsconfig files are written; strings are kept intact. */
export function parseJsonc(text: string): unknown {
  let out = ''
  let i = 0
  while (i < text.length) {
    const c = text[i] ?? ''
    if (c === '"') {
      const end = /^"(?:[^"\\\n]|\\.)*"/.exec(text.slice(i))?.[0] ?? c
      out += end
      i += end.length
    } else if (text.startsWith('//', i)) {
      while (i < text.length && text[i] !== '\n') i++
    } else if (text.startsWith('/*', i)) {
      const end = text.indexOf('*/', i + 2)
      i = end === -1 ? text.length : end + 2
    } else {
      out += c
      i++
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1')) as unknown
}

interface RawConfig {
  extends?: string | string[]
  compilerOptions?: { module?: string; moduleResolution?: string; paths?: Record<string, string[]>; baseUrl?: string }
  include?: string[]
  files?: string[]
  references?: { path: string }[]
}

const RESOLUTIONS: Record<string, ModuleResolution> = { bundler: 'bundler', node16: 'node16', nodenext: 'nodenext' }

/**
 * The fallback when the project's `typescript` has no JS API, as 7.x has none, or is not installed yet:
 * `extends` (relative or from node_modules), `paths`, `include` and `references`, which is all detection reads.
 */
export function jsoncReader(files: Files): ReadProject {
  const load = (path: string, seen: Set<string>): { options: RawConfig['compilerOptions'] & { pathsBase?: string }; raw: RawConfig } => {
    if (seen.has(path)) throw new Error(`${path}: extends itself`)
    seen.add(path)
    const raw = parseJsonc(files.read(path)) as RawConfig
    const dir = posix.dirname(path)
    let options: RawConfig['compilerOptions'] & { pathsBase?: string } = {}
    let inherited: RawConfig = {}
    const parents = raw.extends === undefined ? [] : Array.isArray(raw.extends) ? raw.extends : [raw.extends]
    for (const spec of parents) {
      const target = resolveExtends(files, dir, spec)
      if (target === null) continue
      const parent = load(target, seen)
      options = { ...options, ...parent.options }
      inherited = { ...inherited, ...(parent.raw.include === undefined ? {} : { include: rebase(parent.raw.include, posix.dirname(target), dir) }) }
      if (parent.raw.files !== undefined) inherited.files = parent.raw.files
    }
    const own = raw.compilerOptions ?? {}
    options = { ...options, ...own }
    if (own.paths !== undefined) options.pathsBase = dir
    if (own.baseUrl !== undefined) options.pathsBase = posix.join(dir, own.baseUrl)
    return { options, raw: { ...inherited, ...raw } }
  }
  return (configPath) => {
    const path = toPosix(configPath)
    const { options, raw } = load(path, new Set())
    const dir = posix.dirname(path)
    const module = options.module?.toLowerCase() ?? ''
    const explicit = options.moduleResolution?.toLowerCase()
    const fromModule = /^node(16|18|20)$/.test(module) ? 'node16' : module === 'nodenext' ? 'nodenext' : 'bundler'
    return {
      path,
      moduleResolution: explicit === undefined ? fromModule : (RESOLUTIONS[explicit] ?? 'other'),
      paths: options.paths ?? {},
      pathsBase: options.pathsBase ?? dir,
      include: raw.include ?? (raw.files === undefined ? ['**/*'] : []),
      filesOnly: raw.files !== undefined && raw.files.length === 0 && raw.include === undefined,
      references: (raw.references ?? []).map((r) => {
        const p = posix.join(dir, toPosix(r.path))
        return p.endsWith('.json') ? p : posix.join(p, 'tsconfig.json')
      }),
    }
  }
}

const rebase = (patterns: string[], from: string, to: string): string[] =>
  patterns.map((p) => posix.relative(to, posix.join(from, p)) || '.')

function resolveExtends(files: Files, dir: string, spec: string): string | null {
  const withJson = (p: string) => (p.endsWith('.json') ? p : `${p}.json`)
  if (spec.startsWith('.') || spec.startsWith('/')) {
    const p = withJson(posix.resolve(dir, spec))
    return files.exists(p) ? p : null
  }
  for (const d of ancestors(dir)) {
    const base = posix.join(d, 'node_modules', spec)
    for (const candidate of [base, withJson(base), posix.join(base, 'tsconfig.json')]) {
      if (files.exists(candidate) && !files.isDir(candidate)) return candidate
    }
    const pkg = readJson(files, posix.join(base, 'package.json')) as { tsconfig?: string } | null
    if (pkg?.tsconfig !== undefined) return posix.join(base, pkg.tsconfig)
  }
  return null
}
