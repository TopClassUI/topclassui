// pnpm test:consumers --tarball <topclassui-x.tgz>: plan 4, "Consumer test, online". Not in pnpm check.
// Each fixture is copied outside the repository, installs its own dependencies, runs the packed bin through
// npx, and must type-check and build with copies only: topclassui never enters the fixture's package.json.
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const HERE = dirname(fileURLToPath(import.meta.url))
const { values } = parseArgs({
  options: {
    tarball: { type: 'string' },
    components: { type: 'string', default: 'button dialog' },
    fixture: { type: 'string', multiple: true, default: ['next-app', 'vite-react'] },
    keep: { type: 'boolean', default: false },
  },
})
if (values.tarball === undefined) {
  console.error('consumers: pass --tarball <path to the packed topclassui .tgz>')
  process.exit(2)
}
const tarball = resolve(values.tarball)
const failures: string[] = []

function sh(cwd: string, command: string, args: string[]): string {
  console.log(`\n$ ${[command, ...args].join(' ')}   (in ${cwd})`)
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: { ...process.env, CI: '1' }, maxBuffer: 1 << 26 })
  const out = `${result.stdout}${result.stderr}`
  console.log(out.trimEnd())
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited with ${String(result.status)}`)
  return out
}

const PAGE_NEXT = `import { Button } from '@/topclassui/components/button'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '@/topclassui/components/dialog'

export default function Home() {
  return (
    <main>
      <Button>Save</Button>
      <DialogRoot>
        <DialogTrigger render={<Button>Publish</Button>} />
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Publish changes</DialogTitle>
            <DialogDescription>Your changes go live right away.</DialogDescription>
          </DialogHeader>
          <DialogBody>11 files changed.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
    </main>
  )
}
`

const LAYOUT_NEXT = `import type { ReactNode } from 'react'
import { TopClassProvider } from '@/topclassui/shared/provider/provider'
import { ThemeScript } from '@/topclassui/shared/theme/theme-script'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
      </body>
    </html>
  )
}
`

const APP_VITE = PAGE_NEXT.replaceAll('@/topclassui/', './topclassui/').replace('export default function Home', 'export default function App')

const MAIN_VITE = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TopClassProvider } from './topclassui/shared/provider/provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TopClassProvider direction="ltr" locale="en">
      <App />
    </TopClassProvider>
  </StrictMode>,
)
`

function consumer(fixture: string): void {
  const app = mkdtempSync(join(tmpdir(), `topclassui-${fixture}-`))
  cpSync(join(HERE, '../test/fixtures', fixture), app, { recursive: true })
  const npx = (...args: string[]) => sh(app, 'npx', ['--yes', '--package', tarball, 'topclassui', ...args])
  try {
    sh(app, 'npm', ['install', '--no-audit', '--no-fund'])
    npx('init', '--yes')
    for (const slug of values.components.split(/\s+/).filter(Boolean)) npx('add', slug, '--yes')
    npx('diff')
    const pkg = readFileSync(join(app, 'package.json'), 'utf8')
    if (pkg.includes('"topclassui"')) throw new Error('topclassui reached the fixture package.json')
    if (fixture === 'next-app') {
      writeFileSync(join(app, 'src/app/page.tsx'), PAGE_NEXT)
      writeFileSync(join(app, 'src/app/layout.tsx'), LAYOUT_NEXT)
      sh(app, 'npx', ['next', 'build'])
      sh(app, 'npx', ['tsc', '--noEmit'])
      const html = readFileSync(join(app, '.next/server/app/index.html'), 'utf8')
      for (const needle of ['data-size="md"', 'dir="rtl"', '>Save<', '>Publish<']) {
        if (!html.includes(needle)) throw new Error(`the prerendered page lacks ${needle}`)
      }
    } else {
      writeFileSync(join(app, 'src/App.tsx'), APP_VITE)
      writeFileSync(join(app, 'src/main.tsx'), MAIN_VITE)
      sh(app, 'npx', ['tsc', '-b'])
      const out = sh(app, 'npx', ['vite', 'build'])
      if (/MODULE_LEVEL_DIRECTIVE|Module level directives/.test(out)) throw new Error('vite warned about a module-level directive')
      if (!existsSync(join(app, 'dist/index.html'))) throw new Error('vite build wrote no dist/index.html')
    }
    console.log(`\nconsumers: ${fixture} passed (${app})`)
  } catch (error) {
    failures.push(`${fixture}: ${error instanceof Error ? error.message : String(error)} (${app})`)
    return
  }
  if (!values.keep) rmSync(app, { recursive: true, force: true })
}

for (const fixture of values.fixture) consumer(fixture)
for (const failure of failures) console.error(`consumers: FAILED ${failure}`)
process.exit(failures.length === 0 ? 0 : 1)
