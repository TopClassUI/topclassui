// Plan 3.4: what kind of project this is, read from files alone. The first matching rule of each row wins.
import { posix } from 'node:path'

import { CliError } from './errors.js'
import { ancestors, readJson, type Files } from './files.js'
import { atLeast, format, minVersion, parseVersion, type Version } from './semver.js'
import { toPosix } from './specifiers.js'
import { covers, type ModuleResolution, type ReadProject, type TsProject } from './tsconfig.js'

export type Framework = 'next-app' | 'vite-react'
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'
export const PACKAGE_MANAGERS: readonly PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']

export interface PackageJson {
  name?: string
  packageManager?: string
  workspaces?: unknown
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export interface Project {
  root: string
  pkg: PackageJson
  deps: Record<string, string>
  framework: Framework
  /** Whether the app lives under src/ (Next.js `src/app`; always for Vite). */
  srcDir: boolean
  /** The copied folder, relative to the root. */
  dir: string
  versions: { react: string; framework: string; tailwind: string; typescript: string }
  moduleResolution: Exclude<ModuleResolution, 'other'>
  /** The tsconfig whose `include` reaches the folder, for paths and for the coverage warning. */
  tsconfig: TsProject
  packageManager: { name: PackageManager; source: string }
  warnings: string[]
}

const SKIP = new Set(['node_modules', '.next', 'dist', 'build', 'public', '.git', 'out', 'coverage'])
const VITE_CONFIGS = ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs'].map((e) => `vite.config.${e}`)
const TAILWIND_IMPORT = /^\s*@import\s+(url\()?\s*["']tailwindcss["']/m
export const TAILWIND_FLOOR: Version = [4, 2, 0]

export const CSS_CANDIDATES: Record<Framework, string[]> = {
  'next-app': ['app/globals.css', 'src/app/globals.css'],
  'vite-react': ['src/index.css', 'src/App.css', 'src/main.css', 'src/styles.css'],
}

/** The installed version from node_modules, walking up for a hoisted install; else the range's floor. */
export function installedVersion(files: Files, root: string, name: string, range: string | undefined): string | null {
  for (const dir of ancestors(root)) {
    const pkg = readJson(files, posix.join(dir, 'node_modules', name, 'package.json')) as { version?: string } | null
    if (pkg?.version !== undefined) return pkg.version
  }
  const floor = range === undefined ? null : minVersion(range)
  return floor === null ? null : format(floor)
}

export function readPackage(files: Files, root: string): PackageJson {
  const pkg = readJson(files, posix.join(root, 'package.json')) as PackageJson | null
  if (pkg === null) throw new CliError(`No package.json in ${root}. Run inside your app, or pass --cwd.`)
  return pkg
}

export function detectFramework(files: Files, root: string, deps: Record<string, string>, pkg: PackageJson): { framework: Framework; srcDir: boolean } {
  const has = (p: string) => files.isDir(posix.join(root, p))
  const isWorkspace = files.exists(posix.join(root, 'pnpm-workspace.yaml')) || pkg.workspaces !== undefined
  if (isWorkspace && deps.next === undefined && deps.vite === undefined) {
    throw new CliError('This is a workspace root. Pass --cwd apps/<your-app>.')
  }
  if (deps.next !== undefined) {
    if (has('app') || has('src/app')) return { framework: 'next-app', srcDir: has('src/app') }
    if (has('pages') || has('src/pages')) {
      throw new CliError('The Pages Router is not supported (DECISIONS 2 Oct). Use the App Router, or import from the package.')
    }
  }
  const viteReact = deps.vite !== undefined && (deps['@vitejs/plugin-react'] !== undefined || deps['@vitejs/plugin-react-swc'] !== undefined)
  const reactRouter = ['ts', 'js', 'mjs', 'mts'].some((e) => files.exists(posix.join(root, `react-router.config.${e}`)))
  if (viteReact && !reactRouter && VITE_CONFIGS.some((c) => files.exists(posix.join(root, c)))) {
    return { framework: 'vite-react', srcDir: true }
  }
  throw new CliError('Only Next.js App Router and Vite with React are supported (DECISIONS 2 Oct).')
}

export function detectPackageManager(files: Files, root: string, env: Record<string, string | undefined>, flag?: string): { name: PackageManager; source: string } {
  if (flag !== undefined) {
    if (!(PACKAGE_MANAGERS as readonly string[]).includes(flag)) throw new CliError(`--pm takes npm, pnpm, yarn or bun, not ${flag}.`)
    return { name: flag as PackageManager, source: '--pm' }
  }
  const dirs = ancestors(root)
  for (const dir of dirs) {
    const field = (readJson(files, posix.join(dir, 'package.json')) as PackageJson | null)?.packageManager
    const name = field?.split('@')[0]
    if (name !== undefined && (PACKAGE_MANAGERS as readonly string[]).includes(name)) {
      return { name: name as PackageManager, source: `packageManager in ${posix.relative(root, posix.join(dir, 'package.json')) || 'package.json'}` }
    }
  }
  const locks: [string, PackageManager][] = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
    ['package-lock.json', 'npm'],
    ['npm-shrinkwrap.json', 'npm'],
  ]
  for (const dir of dirs) {
    for (const [file, name] of locks) {
      if (files.exists(posix.join(dir, file))) return { name, source: posix.relative(root, posix.join(dir, file)) || file }
    }
  }
  const agent = env.npm_config_user_agent?.split('/')[0]
  if (agent !== undefined && (PACKAGE_MANAGERS as readonly string[]).includes(agent)) {
    return { name: agent as PackageManager, source: 'npm_config_user_agent' }
  }
  return { name: 'npm', source: 'default' }
}

/** The CSS files that import tailwindcss: the framework's usual places first, then a search to depth 5. */
export function cssCandidates(files: Files, root: string, framework: Framework): string[] {
  const imports = (rel: string) => TAILWIND_IMPORT.test(files.read(posix.join(root, rel)))
  const known = CSS_CANDIDATES[framework].filter((rel) => files.exists(posix.join(root, rel)) && imports(rel))
  if (known.length > 0) return known.slice(0, 1)
  const found: string[] = []
  const walk = (rel: string, depth: number) => {
    for (const name of files.list(posix.join(root, rel)).sort()) {
      if (SKIP.has(name)) continue
      const child = rel === '' ? name : `${rel}/${name}`
      if (files.isDir(posix.join(root, child))) {
        if (depth < 5) walk(child, depth + 1)
      } else if (name.endsWith('.css') && imports(child)) found.push(child)
    }
  }
  walk('', 1)
  return found
}

export function defaultDir(framework: Framework, srcDir: boolean): string {
  return framework === 'vite-react' || srcDir ? 'src/topclassui' : 'topclassui'
}

/** The tsconfig that reaches the folder: the root one, or a Vite template's `tsconfig.app.json` reference. */
export function projectFor(read: ReadProject, root: string, dir: string, files: Files): { project: TsProject; covered: boolean } {
  const rootConfig = posix.join(root, 'tsconfig.json')
  if (!files.exists(rootConfig)) throw new CliError('TopClass UI supports TypeScript projects only.')
  const first = read(rootConfig)
  const probe = posix.join(root, dir, 'components/x/index.tsx')
  const candidates = [first, ...first.references.filter((r) => files.exists(r)).map((r) => read(r))]
  const match = candidates.find((p) => covers(p, probe))
  if (match !== undefined) return { project: match, covered: true }
  return { project: candidates.find((p) => !p.filesOnly) ?? first, covered: false }
}

/** `@/*` pointing at the folder's parent gives `@/`; the import prefix a printed line uses for the folder. */
export function importBase(project: TsProject, root: string, dir: string): string {
  const folder = posix.join(toPosix(root), dir)
  for (const [key, targets] of Object.entries(project.paths)) {
    const target = targets[0]
    if (!key.endsWith('/*') || target?.endsWith('/*') !== true) continue
    const base = posix.join(project.pathsBase, target.slice(0, -2))
    const rel = posix.relative(base, folder)
    if (!rel.startsWith('..') && !posix.isAbsolute(rel)) return `${key.slice(0, -1)}${rel}`
  }
  return `./${dir}`
}

export interface DetectOptions {
  files: Files
  root: string
  env: Record<string, string | undefined>
  read: ReadProject
  dir: string | undefined
  pm: string | undefined
}

export function detect(options: DetectOptions): Project {
  const { files, env } = options
  const root = toPosix(options.root)
  const pkg = readPackage(files, root)
  const deps = { ...pkg.devDependencies, ...pkg.dependencies }
  const { framework, srcDir } = detectFramework(files, root, deps, pkg)
  const warnings: string[] = []
  const version = (name: string) => installedVersion(files, root, name, deps[name])

  const react = version('react')
  if (!atLeast(parseVersion(react ?? ''), [19, 0, 0])) throw new CliError('React 19 or newer is required.')
  const frameworkVersion = version(framework === 'next-app' ? 'next' : 'vite') ?? '0'
  if (framework === 'next-app' && !atLeast(parseVersion(frameworkVersion), [15, 0, 0])) {
    throw new CliError('Next.js 15 or newer is required.')
  }
  if (deps.typescript === undefined || !files.exists(posix.join(root, 'tsconfig.json'))) {
    throw new CliError('TopClass UI supports TypeScript projects only.')
  }
  const tailwind = version('tailwindcss')
  if (!atLeast(parseVersion(tailwind ?? ''), TAILWIND_FLOOR)) {
    const guide = framework === 'next-app' ? 'framework-guides/nextjs' : 'installation/using-vite'
    throw new CliError(`Tailwind CSS v4.2 or newer is required: https://tailwindcss.com/docs/${guide}`)
  }
  const plugin = framework === 'next-app' ? '@tailwindcss/postcss' : '@tailwindcss/vite'
  if (deps[plugin] === undefined) warnings.push(`${plugin} is not in package.json; make sure Tailwind CSS runs over the copied files.`)

  const dir = options.dir ?? defaultDir(framework, srcDir)
  const { project, covered } = projectFor(options.read, root, dir, files)
  if (!covered) warnings.push(`No tsconfig include reaches ${dir}/; add it, or the copies are not type-checked.`)
  if (project.moduleResolution === 'other') {
    throw new CliError(`${posix.relative(root, project.path)} must set "moduleResolution" to "bundler", "node16" or "nodenext".`)
  }

  return {
    root,
    pkg,
    deps,
    framework,
    srcDir,
    dir,
    versions: {
      react: react ?? '',
      framework: frameworkVersion,
      tailwind: tailwind ?? '',
      typescript: version('typescript') ?? '',
    },
    moduleResolution: project.moduleResolution,
    tsconfig: project,
    packageManager: detectPackageManager(files, root, env, options.pm),
    warnings,
  }
}

/** Whether the app already uses the package, whose provider the copies cannot see (plan F9). */
export function usesPackage(files: Files, project: Project): string | null {
  if (project.deps.topclassui !== undefined) return 'topclassui is in package.json'
  const pattern = /from\s+["']topclassui(\/[^"']*)?["']/
  const walk = (rel: string, depth: number): string | null => {
    for (const name of files.list(posix.join(project.root, rel))) {
      if (SKIP.has(name) || name === 'topclassui') continue
      const child = rel === '' ? name : `${rel}/${name}`
      const abs = posix.join(project.root, child)
      if (files.isDir(abs)) {
        const hit = depth < 5 ? walk(child, depth + 1) : null
        if (hit !== null) return hit
      } else if (/\.(tsx?|mts|cts)$/.test(name) && pattern.test(files.read(abs))) return `${child} imports topclassui`
    }
    return null
  }
  return walk('', 1)
}
