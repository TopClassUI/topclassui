// pnpm test:consumers - two consumer apps, built and served from the packed tarball (release plan R7). Needs the network.
import { type ChildProcess, spawn, spawnSync } from 'node:child_process'
import {
  copyFileSync, cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'

import {
  BUILT_CSS_DIR, HOST, LOCAL_TARBALL, type Manifest, NAME_ENV, type Run, URL_ENV, consumerManifest, consumerPort,
  missingProbes, newestTarball, parseArgs, runsFor, serverCommand, stepTitles,
} from './lib/consumer-smoke.js'

const ROOT = process.cwd()
const options = parseArgs(process.argv.slice(2))
const runs = runsFor(options.only)
const basePort = consumerPort()
const PLAYWRIGHT_CONFIG = join('scripts', 'consumer-smoke', 'playwright.config.ts')

if (options.dry) {
  console.log('consumer-smoke --dry: nothing runs. The steps are:')
  console.log(options.tarball ? `  use the tarball ${options.tarball}` : '  pnpm check:package, then take the newest .tgz in .pack/')
  runs.forEach((run, i) => {
    console.log(`\n${run.name}`)
    stepTitles(run, basePort + i).forEach((title, n) => { console.log(`  ${String(n + 1)}. ${title}`) })
  })
  process.exit(0)
}

// npm and pnpm are .cmd shims on Windows, which only a shell can start; node never needs one. No argument holds a space.
function exec(title: string, command: string, args: string[], cwd: string, env: Record<string, string> = {}) {
  const shell = process.platform === 'win32' && command !== 'node'
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell, env: { ...process.env, ...env } })
  if (result.status !== 0) throw new Error(`${title} failed (exit ${String(result.status)})`)
}

function packedTarball(): string {
  if (options.tarball) {
    const file = resolve(ROOT, options.tarball)
    if (!existsSync(file)) throw new Error(`consumer-smoke: ${file} does not exist`)
    return file
  }
  exec('pnpm check:package', 'pnpm', ['check:package'], ROOT)
  const pack = join(ROOT, '.pack')
  const files = existsSync(pack) ? readdirSync(pack).map((name) => ({ name, mtimeMs: statSync(join(pack, name)).mtimeMs })) : []
  const newest = newestTarball(files)
  if (newest === null) throw new Error('consumer-smoke: check:package left no .tgz in .pack/')
  return join(pack, newest)
}

/** Output a template folder may hold after someone ran it in place; none of it belongs in a fresh install. */
const SKIP = new Set(['node_modules', '.next', 'dist', 'next-env.d.ts', 'tsconfig.tsbuildinfo', 'package-lock.json'])

function copyTemplate(run: Run, dir: string) {
  cpSync(join(ROOT, 'consumers', run.template), dir, { recursive: true, filter: (src) => !SKIP.has(basename(src)) })
}

function writeManifest(run: Run, dir: string, tarball: string) {
  const template = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as Manifest
  const floors = run.floors
    ? JSON.parse(readFileSync(join(ROOT, 'consumers', run.template, 'floors.json'), 'utf8')) as Record<string, string>
    : {}
  copyFileSync(tarball, join(dir, LOCAL_TARBALL))
  writeFileSync(join(dir, 'package.json'), `${JSON.stringify(consumerManifest(template, floors), null, 2)}\n`)
}

function cssUnder(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) cssUnder(p, out)
    else if (e.name.endsWith('.css')) out.push(p)
  }
  return out
}

/** The one proof that the @source lines of styles.css reach node_modules/topclassui/dist in a real build. */
function checkBuiltCss(run: Run, dir: string) {
  const files = cssUnder(join(dir, BUILT_CSS_DIR[run.template]))
  if (files.length === 0) throw new Error(`no .css under ${BUILT_CSS_DIR[run.template]}`)
  const missing = missingProbes(files.map((f) => readFileSync(f, 'utf8')).join('\n'))
  if (missing.length > 0) {
    throw new Error(`the built CSS lacks ${missing.join(' and ')}: Tailwind did not scan node_modules/topclassui/dist`)
  }
  console.log(`  ${String(files.length)} css file(s), every probe found`)
}

function stopServer(child: ChildProcess) {
  if (child.exitCode !== null || child.pid === undefined) return
  // next start forks workers; on Windows only taskkill reaches the whole tree.
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  else child.kill('SIGTERM')
}

async function startServer(run: Run, dir: string, port: number): Promise<ChildProcess> {
  const child = spawn('node', serverCommand(run.template, port), { cwd: dir, stdio: 'inherit' })
  const origin = `http://${HOST}:${String(port)}`
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`the server exited with ${String(child.exitCode)} before answering`)
    try {
      if ((await fetch(origin)).ok) return child
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  stopServer(child)
  throw new Error(`${origin} did not answer within 90 s`)
}

function playwright(run: Run, port: number) {
  const cli = join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js')
  exec('playwright test', 'node', [cli, 'test', '-c', PLAYWRIGHT_CONFIG], ROOT, {
    [URL_ENV]: `http://${HOST}:${String(port)}`,
    [NAME_ENV]: run.name,
  })
}

const tarball = packedTarball()
console.log(`\nconsumer-smoke: ${tarball}`)
const failed: string[] = []

for (const [i, run] of runs.entries()) {
  const port = basePort + i
  const dir = mkdtempSync(join(tmpdir(), `tc-consumer-${run.name}-`))
  const titles = stepTitles(run, port)
  let step = -1
  const next = () => { step++; console.log(`\n[${run.name}] ${String(step + 1)}/${String(titles.length)} ${titles[step] ?? ''}`) }
  let server: ChildProcess | null = null
  let ok = false
  try {
    next(); copyTemplate(run, dir)
    next(); writeManifest(run, dir, tarball)
    next(); exec('npm install', 'npm', ['install', '--no-audit', '--no-fund'], dir)
    next(); exec('npm run build', 'npm', ['run', 'build'], dir)
    // After the build: Next writes next-env.d.ts then, and the template does not ship one.
    next(); exec('tsc --noEmit', 'node', [join(dir, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit'], dir)
    next(); checkBuiltCss(run, dir)
    next(); server = await startServer(run, dir, port)
    next(); playwright(run, port)
    next()
    ok = true
    console.log(`\n${run.name}: ok`)
  } catch (error) {
    failed.push(run.name)
    console.error(`\n${run.name}: FAILED at "${titles[step] ?? ''}"\n  ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    if (server) stopServer(server)
    // A failed run keeps its folder for a look; a passing one is deleted unless --keep asked otherwise.
    if (ok && !options.keep) rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 })
    else console.log(`  kept: ${dir}`)
  }
}

if (failed.length > 0) {
  console.error(`\nconsumer-smoke: ${String(failed.length)} of ${String(runs.length)} run(s) failed: ${failed.join(', ')}`)
  process.exit(1)
}
console.log(`\nconsumer-smoke: ${String(runs.length)} run(s) ok`)
