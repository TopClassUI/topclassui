// R-5.1-1, R-5.1-4, R-5.1-5, R-7-1: what may cross the server and client boundary.
import { readdirSync, readFileSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'

import {
  exportsAsync,
  hasLateUseClient,
  hasUseClient,
  importedModules,
  importsOwnHook,
  isServerPart,
  relativeImportsMissingExtension,
  serverUnsafeHooks,
} from './lib/source-checks.js'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

/** Only this file may be async or import server-only; everything else renders in a plain React tree. */
const RSC_ONLY = posix.join('src', 'components', 'icon', 'index.tsx')

const errors: string[] = []
const rel = (p: string) => relative(ROOT, p).split(sep).join(posix.sep)

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(e.name)) out.push(p)
  }
  return out
}

let files: string[] = []
try {
  files = walk(SRC)
} catch {
  console.log('check-boundaries: ok (no src yet)')
  process.exit(0)
}

for (const file of files) {
  const r = rel(file)
  const source = readFileSync(file, 'utf8')
  const isIndex = /(^|\/)index\.tsx$/.test(r)
  const isClient = /(^|\/)client\.tsx$/.test(r)
  const isHook = /(^|\/)hook\.ts$/.test(r)
  const isLib = /(^|\/)lib\.tsx?$/.test(r)
  const isTypes = /(^|\/)types\.ts$/.test(r)

  if (hasLateUseClient(source)) {
    errors.push(`${r}: 'use client' must be the first statement in the file, or it is a dead string.`)
  }

  if (isIndex) {
    if (hasUseClient(source)) errors.push(`${r}: index.tsx never contains 'use client' (R-5.1-1).`)
    for (const name of serverUnsafeHooks(source)) {
      errors.push(`${r}: uses ${name} from react. A Server Component may only call useId and use (R-5.1-1).`)
    }
    if (importsOwnHook(source)) {
      errors.push(`${r}: imports ./hook.js. Only client.tsx and its 'use client' parts may (R-5.1-1).`)
    }
    if (/\bcreateContext\s*\(|\buseContext\s*\(/.test(source)) {
      errors.push(`${r}: React context does not exist in a Server Component render. Direction and theme come from dir and data-theme (R-5.1-4).`)
    }
    if (r !== RSC_ONLY && exportsAsync(source)) {
      errors.push(`${r}: only ${RSC_ONLY} may be async; every other index.tsx must render in a non-RSC tree (R-5.1-5).`)
    }
  }

  // index.tsx may import a part with no directive, so such a part is held to index.tsx's hook rules.
  if (isServerPart(r, source)) {
    for (const name of serverUnsafeHooks(source)) {
      errors.push(`${r}: uses ${name} from react with no 'use client'. A part index.tsx can render may only call useId and use (R-5.1-1).`)
    }
    if (importsOwnHook(source)) {
      errors.push(`${r}: imports ../hook.js with no 'use client'. Only client.tsx and its 'use client' parts may (R-5.1-1).`)
    }
  }

  const modules = importedModules(source)

  if (r !== RSC_ONLY && modules.includes('server-only')) {
    errors.push(`${r}: only ${RSC_ONLY} may import server-only (R-5.1-5).`)
  }

  if (modules.some((m) => /icons\/loaders/.test(m)) && !r.startsWith('src/components/icon/')) {
    errors.push(`${r}: the icon loader map is private to components/icon (R-7-1).`)
  }

  if (isClient && !hasUseClient(source)) {
    errors.push(`${r}: client.tsx must start with 'use client' (R-8.1-1).`)
  }

  if (isHook) {
    if (/<[A-Za-z]/.test(source.replace(/\/\/.*$/gm, ''))) {
      errors.push(`${r}: hook.ts returns a plain object and contains no JSX (R-8.1-1).`)
    }
  }

  if (isLib && /from\s+['"]react['"]/.test(source)) {
    errors.push(`${r}: lib.ts holds pure helpers and imports no React (R-8.1-1).`)
  }

  if (isTypes && /^(?!.*\btype\b).*\bexport\s+(const|function|class|let|var)\s/m.test(source)) {
    errors.push(`${r}: types.ts is types only, so the file erases completely (R-8.3-4).`)
  }

  for (const spec of relativeImportsMissingExtension(source)) {
    errors.push(`${r}: relative import "${spec}" needs a .js extension (R-5.12-5).`)
  }
}

for (const e of errors) console.error(`error ${e}`)

if (errors.length) {
  console.error(`\ncheck-boundaries: ${errors.length} error${errors.length === 1 ? '' : 's'}.`)
  process.exit(1)
}
console.log(`check-boundaries: ok (${files.length} file${files.length === 1 ? '' : 's'})`)
