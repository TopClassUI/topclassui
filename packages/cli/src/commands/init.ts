// Plan 3.5: detect, copy base, add two lines to the CSS entry, install, write topclassui.json, print the snippet.
import { writeFileSync } from 'node:fs'
import { posix } from 'node:path'

import type { Context } from '../context.js'
import { BASE } from '../lib/registry.js'
import { addImports, importLines } from '../lib/css.js'
import { cssCandidates, usesPackage, type Project } from '../lib/detect.js'
import { CliError, EXIT, type ExitCode } from '../lib/errors.js'
import { CONFIG_FILE, type Config } from '../lib/lock.js'
import { applyItems, installPackages, openSession, projectRoot, readConfig, saveConfig, type Flags, type Session } from './shared.js'

const FRAMEWORK_NAME = { 'next-app': 'Next.js', 'vite-react': 'Vite' } as const

export function detectionLines(project: Project): string[] {
  const v = project.versions
  const kind = project.framework === 'next-app' ? ', App Router' : ', React'
  return [
    `Detected ${FRAMEWORK_NAME[project.framework]} ${v.framework}${kind}, TypeScript ${v.typescript}, Tailwind ${v.tailwind}`,
    `Detected ${project.packageManager.name} (${project.packageManager.source})`,
  ]
}

async function chooseCss(ctx: Context, session: Session): Promise<string> {
  if (session.flags.css !== undefined) return session.flags.css
  const found = cssCandidates(ctx.files, session.project.root, session.project.framework)
  const first = found[0]
  if (first === undefined) {
    if (!session.interactive) throw new CliError('No CSS file imports tailwindcss. Pass --css <file>.')
    return ctx.ask('CSS file that imports tailwindcss?', CSS_FALLBACK[session.project.framework])
  }
  if (found.length > 1 && !session.interactive) {
    throw new CliError(`Several CSS files import tailwindcss (${found.join(', ')}). Pass --css <file>.`)
  }
  return session.interactive ? ctx.ask('CSS entry?', first) : first
}

const CSS_FALLBACK = { 'next-app': 'app/globals.css', 'vite-react': 'src/index.css' } as const

/** The alias form when the app has one, else a path relative from the file the snippet belongs in. */
export function importFrom(session: Session, file: string): string {
  if (!session.rewrite.importBase.startsWith('./')) return session.rewrite.importBase
  const rel = posix.relative(posix.dirname(file), session.dir)
  return rel.startsWith('.') ? rel : `./${rel}`
}

export function snippet(session: Session): string[] {
  const vite = session.project.framework === 'vite-react'
  const base = importFrom(session, vite ? 'src/main.tsx' : session.project.srcDir ? 'src/app/layout.tsx' : 'app/layout.tsx')
  if (vite) {
    return [
      '// src/main.tsx: wrap the app once; direction and locale are yours to derive.',
      `import { TopClassProvider } from '${base}/shared/provider/provider'`,
      '',
      'createRoot(document.getElementById(\'root\')!).render(',
      '  <TopClassProvider direction="ltr" locale="en">',
      '    <App />',
      '  </TopClassProvider>,',
      ')',
    ]
  }
  return [
    '// app/layout.tsx (or app/[locale]/layout.tsx): direction and locale come from the route (R-13-1).',
    `import { TopClassProvider } from '${base}/shared/provider/provider'`,
    `import { ThemeScript } from '${base}/shared/theme/theme-script'`,
    '',
    '<html lang={locale} dir={direction} suppressHydrationWarning>',
    '  <head><ThemeScript /></head>',
    '  <body>',
    '    <TopClassProvider direction={direction} locale={locale}>{children}</TopClassProvider>',
    '  </body>',
    '</html>',
  ]
}

/** Runs init and returns the config it wrote, so `add` can carry on in the same run. */
export async function runInit(ctx: Context, flags: Flags): Promise<{ code: ExitCode; config: Config | null; session: Session | null }> {
  const root = projectRoot(ctx, flags)
  const existing = readConfig(ctx, root)
  if (existing !== null && !flags.force) {
    if (!flags.silent) ctx.out(`Already initialised: ${CONFIG_FILE} exists. Nothing to do; --force rewrites base.`)
    return { code: EXIT.ok, config: existing, session: null }
  }
  let session = openSession(ctx, flags)
  for (const line of [...detectionLines(session.project), ...session.project.warnings.map((w) => `Warning: ${w}`)]) session.log(line)

  const clash = usesPackage(ctx.files, session.project)
  if (clash !== null && !flags.force) {
    throw new CliError(
      `${clash}. Copied components read the copied provider, and the package's provider is a different context, ` +
        `so they would silently fall back to English and ltr. Mount the provider from ${session.dir}/shared/provider/provider, ` +
        'or use only the package. --force goes ahead anyway.',
    )
  }

  const css = toCss(await chooseCss(ctx, session))
  if (session.interactive && flags.dir === undefined && existing === null) {
    const dir = await ctx.ask('Folder for the copied components?', session.dir)
    if (dir !== session.dir) session = openSession(ctx, flags, dir)
  }
  session.log(`CSS entry  ${css}`)
  session.log(`Folder     ${session.dir}`)

  const config: Config = existing ?? {
    version: 1,
    framework: session.project.framework,
    css,
    dir: session.dir,
    imports: 'relative',
    packageManager: session.project.packageManager.name,
    lock: { registry: session.index.version, files: {} },
  }
  config.css = css
  config.framework = session.project.framework
  const result = applyItems(session, config, [BASE], true)

  const cssPath = posix.join(session.project.root, css)
  if (!ctx.files.exists(cssPath)) throw new CliError(`${css} does not exist. Pass --css <file>.`)
  const edit = addImports(ctx.files.read(cssPath), importLines(css, session.dir))
  if (edit.added.length > 0) {
    if (!flags.dryRun) writeFileSync(cssPath, edit.text)
    session.log(`Added to ${css}:`)
    for (const line of edit.added) session.log(`  ${line}`)
  } else session.log(`${css} already imports the folder's tokens.css and styles.css`)

  saveConfig(session, config)
  session.log(`${flags.dryRun ? 'Would write' : 'Wrote'} ${String(result.written)} files and ${CONFIG_FILE}`)
  const code = await installPackages(session, result.packages)
  session.log('')
  session.log('Mount the provider yourself; init does not edit your layout:')
  for (const line of snippet(session)) session.log(`  ${line}`)
  return { code: result.conflicts.length > 0 && code === EXIT.ok ? EXIT.differs : code, config, session }
}

const toCss = (path: string): string => posix.normalize(path.replaceAll('\\', '/')).replace(/^\.\//, '')

export async function init(ctx: Context, flags: Flags): Promise<ExitCode> {
  return (await runInit(ctx, flags)).code
}
