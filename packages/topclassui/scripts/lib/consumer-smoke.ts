// The pure half of pnpm test:consumers (release plan R7): what the runner decides, with no disk and no network.

export const TEMPLATES = ['next', 'vite'] as const
export type Template = (typeof TEMPLATES)[number]

/** One install of a template. `floors` swaps in the versions of the template's floors.json. */
export interface Run { name: string; template: Template; floors: boolean }

/** Three runs, not two: the Next template once at the newest versions and once at the peer floors. */
export const RUNS: readonly Run[] = [
  { name: 'next-latest', template: 'next', floors: false },
  { name: 'vite', template: 'vite', floors: false },
  { name: 'next-floors', template: 'next', floors: true },
]

/** The runs whose name holds `only`, or all of them; an unknown name is an error, never an empty run. */
export function runsFor(only: string | null): readonly Run[] {
  if (only === null) return RUNS
  const chosen = RUNS.filter((run) => run.name.includes(only))
  if (chosen.length === 0) throw new Error(`consumer-smoke: no run matches "${only}"; the runs are ${RUNS.map((r) => r.name).join(', ')}`)
  return chosen
}

export interface Options { dry: boolean; keep: boolean; only: string | null; tarball: string | null }

/** --dry lists the steps; --keep leaves the folders; --only <name> picks runs; --tarball <file> skips check:package. */
export function parseArgs(argv: readonly string[]): Options {
  const options: Options = { dry: false, keep: false, only: null, tarball: null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--dry') options.dry = true
    else if (arg === '--keep') options.keep = true
    else if (arg === '--only' || arg === '--tarball') {
      const value = argv[i + 1]
      if (value === undefined || value.startsWith('-')) throw new Error(`consumer-smoke: ${arg} needs a value`)
      if (arg === '--only') options.only = value
      else options.tarball = value
      i++
    } else throw new Error(`consumer-smoke: unknown argument "${String(arg)}"`)
  }
  return options
}

/** The first port; each run takes the next one, so a server that outlived its run never answers the next. */
export const CONSUMER_PORT = 4625
export const PORT_ENV = 'TC_CONSUMER_PORT'
/** Set by the runner for the Playwright config and the spec, which run in another process. */
export const URL_ENV = 'TC_CONSUMER_URL'
export const NAME_ENV = 'TC_CONSUMER_NAME'
/** The address, never `localhost`: Windows may resolve that to ::1 while the server listens on IPv4. */
export const HOST = '127.0.0.1'

export function consumerPort(env: Record<string, string | undefined> = process.env): number {
  const raw = env[PORT_ENV]
  if (raw === undefined || raw === '') return CONSUMER_PORT
  const port = Number(raw)
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`consumer-smoke: ${PORT_ENV}="${raw}" is not a port between 1024 and 65535`)
  }
  return port
}

/** The name the tarball gets inside the app folder, so package.json never carries a machine's path. */
export const LOCAL_TARBALL = 'topclassui.tgz'

export interface Manifest {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: unknown
}

/**
 * The app's package.json: the template's pinned versions, each floor swapped in, and the library from the tarball.
 * A floor that names a package the template does not pin is an error: floors.json must stay a list of swaps.
 */
export function consumerManifest(template: Manifest, floors: Record<string, string>): Manifest {
  const dependencies = { ...template.dependencies }
  const devDependencies = { ...template.devDependencies }
  if ('topclassui' in dependencies || 'topclassui' in devDependencies) {
    throw new Error('consumer-smoke: the template must not list topclassui; it comes from the tarball')
  }
  for (const [name, version] of Object.entries(floors)) {
    if (name in dependencies) dependencies[name] = version
    else if (name in devDependencies) devDependencies[name] = version
    else throw new Error(`consumer-smoke: floors.json names "${name}", which the template does not pin`)
  }
  return { ...template, dependencies: { ...dependencies, topclassui: `file:./${LOCAL_TARBALL}` }, devDependencies }
}

/**
 * Strings only the library's own source writes, so the built CSS holds them only if Tailwind
 * scanned node_modules/topclassui/dist through the @source lines of styles.css. Whitespace is
 * ignored on both sides: a minifier may write `outline-width:var(...)` or keep the space.
 */
export const CSS_PROBES = [
  // Button's solid fill, from buttonVariants; a consumer page never writes this class itself.
  '.bg-primary-solid',
  // FOCUS_RING in shared/classes.ts: focus-visible:outline-(length:--tc-ring-width).
  'outline-width:var(--tc-ring-width)',
] as const

export function missingProbes(css: string): string[] {
  const flat = css.replace(/\s+/g, '')
  return CSS_PROBES.filter((probe) => !flat.includes(probe.replace(/\s+/g, '')))
}

/** Where each framework writes its CSS, relative to the app folder; the runner reads every .css below it. */
export const BUILT_CSS_DIR: Record<Template, string> = { next: '.next/static', vite: 'dist/assets' }

/** The production server, run through node and never through a .cmd shim: one node argument list per framework. */
export function serverCommand(template: Template, port: number): string[] {
  const at = String(port)
  return template === 'next'
    ? ['node_modules/next/dist/bin/next', 'start', '-p', at, '-H', HOST]
    : ['node_modules/vite/bin/vite.js', 'preview', '--port', at, '--host', HOST, '--strictPort']
}

export interface TarballFile { name: string; mtimeMs: number }

/** The newest .tgz of the list, or null when there is none; check-pack writes one per run and may leave older ones. */
export function newestTarball(files: readonly TarballFile[]): string | null {
  const tarballs = files.filter((f) => f.name.endsWith('.tgz'))
  if (tarballs.length === 0) return null
  return tarballs.reduce((best, f) => (f.mtimeMs > best.mtimeMs ? f : best)).name
}

/** What one run does, in order; the runner prints these in --dry and does them otherwise. */
export function stepTitles(run: Run, port: number): string[] {
  return [
    `copy consumers/${run.template} to a fresh temp folder`,
    `write package.json: the pinned versions${run.floors ? ', the floors of floors.json' : ''}, topclassui from the tarball`,
    'npm install',
    `npm run build (${run.template === 'next' ? 'next build' : 'vite build'})`,
    'tsc --noEmit: the @ts-expect-error over <Button variant="nope" /> must hold',
    `the built CSS under ${BUILT_CSS_DIR[run.template]} holds ${CSS_PROBES.join(' and ')}`,
    `start the server at http://${HOST}:${String(port)}`,
    'playwright test scripts/consumer-smoke: the components render with the library\'s computed styles',
    'stop the server and delete the folder',
  ]
}
