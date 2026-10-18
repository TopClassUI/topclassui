import { describe, expect, it } from 'vitest'

import { cssCandidates, detect, detectPackageManager, importBase, usesPackage } from '../src/lib/detect.js'
import { memoryFiles } from '../src/lib/files.js'
import { includeMatcher, jsoncReader, parseJsonc } from '../src/lib/tsconfig.js'

const NEXT_PKG = {
  dependencies: { next: '16.4.2', react: '19.3.1', 'react-dom': '19.3.1' },
  devDependencies: { typescript: '5.9.3', tailwindcss: '4.3.3', '@tailwindcss/postcss': '4.3.3' },
}
const NEXT_TSCONFIG = `{
  // create-next-app, with comments and a trailing comma
  "compilerOptions": { "moduleResolution": "bundler", "paths": { "@/*": ["./src/*"], }, },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
}`

function next(extra: Record<string, string> = {}, pkg: object = NEXT_PKG) {
  return {
    '/app/package.json': JSON.stringify(pkg),
    '/app/tsconfig.json': NEXT_TSCONFIG,
    '/app/src/app/page.tsx': 'export default function P() { return null }',
    '/app/src/app/globals.css': '@import "tailwindcss";\n',
    ...extra,
  }
}

const VITE_PKG = {
  dependencies: { react: '^19.2.8', 'react-dom': '^19.2.8' },
  devDependencies: { vite: '^8.3.0', '@vitejs/plugin-react': '^6.1.1', typescript: '~6.0.2', tailwindcss: '^4.3.0', '@tailwindcss/vite': '^4.3.0' },
}

function vite(extra: Record<string, string> = {}) {
  return {
    '/v/package.json': JSON.stringify(VITE_PKG),
    '/v/vite.config.ts': 'export default {}',
    '/v/tsconfig.json': '{ "files": [], "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }] }',
    '/v/tsconfig.app.json': '{ "compilerOptions": { /* Bundler mode */ "moduleResolution": "bundler" }, "include": ["src"] }',
    '/v/tsconfig.node.json': '{ "compilerOptions": { "module": "nodenext" }, "include": ["vite.config.ts"] }',
    '/v/src/index.css': '@import "tailwindcss";\n',
    ...extra,
  }
}

function run(tree: Record<string, string>, root = '/app', options: { dir?: string; pm?: string; env?: Record<string, string> } = {}) {
  const files = memoryFiles(tree)
  return detect({ files, root, env: options.env ?? {}, read: jsoncReader(files), dir: options.dir, pm: options.pm })
}

describe('detect, one case per row of plan 3.4', () => {
  it('needs a package.json', () => {
    expect(() => run({ '/app/x.ts': '' })).toThrow('No package.json in /app. Run inside your app, or pass --cwd.')
  })

  it('refuses a workspace root', () => {
    expect(() => run({ '/r/package.json': '{"private":true}', '/r/pnpm-workspace.yaml': '' }, '/r')).toThrow(
      'This is a workspace root. Pass --cwd apps/<your-app>.',
    )
  })

  it('finds a Next.js App Router project under src/, with no next.config', () => {
    const project = run(next())
    expect([project.framework, project.srcDir, project.dir, project.moduleResolution]).toEqual(['next-app', true, 'src/topclassui', 'bundler'])
    expect(project.versions).toEqual({ react: '19.3.1', framework: '16.4.2', tailwind: '4.3.3', typescript: '5.9.3' })
    expect(project.warnings).toEqual([])
  })

  it('puts the folder at the root when the app has no src/', () => {
    const tree = next({ '/app/app/page.tsx': '' })
    delete (tree as Record<string, string>)['/app/src/app/page.tsx']
    delete (tree as Record<string, string>)['/app/src/app/globals.css']
    expect(run(tree).dir).toBe('topclassui')
  })

  it('refuses the Pages Router', () => {
    const tree = { '/app/package.json': JSON.stringify(NEXT_PKG), '/app/tsconfig.json': '{}', '/app/pages/index.tsx': '' }
    expect(() => run(tree)).toThrow('The Pages Router is not supported (DECISIONS 2 Oct). Use the App Router, or import from the package.')
  })

  it('tests next before vite, which Next.js apps carry through Vitest', () => {
    const pkg = { ...NEXT_PKG, devDependencies: { ...NEXT_PKG.devDependencies, vite: '8.3.4', '@vitejs/plugin-react': '6.1.2' } }
    expect(run(next({ '/app/vite.config.ts': '' }, pkg)).framework).toBe('next-app')
  })

  it('finds Vite with React through the tsconfig.app.json reference', () => {
    const project = run(vite(), '/v')
    expect([project.framework, project.dir, project.moduleResolution]).toEqual(['vite-react', 'src/topclassui', 'bundler'])
    expect(project.tsconfig.path).toBe('/v/tsconfig.app.json')
    expect(project.versions.react).toBe('19.2.8')
  })

  it('refuses React Router framework mode and a project without a known framework', () => {
    expect(() => run(vite({ '/v/react-router.config.ts': '' }), '/v')).toThrow('Only Next.js App Router and Vite with React are supported (DECISIONS 2 Oct).')
    expect(() => run({ '/a/package.json': '{"dependencies":{"react":"19.0.0"}}' }, '/a')).toThrow('Only Next.js App Router')
  })

  it('needs React 19 and Next.js 15', () => {
    const old = { ...NEXT_PKG, dependencies: { ...NEXT_PKG.dependencies, react: '18.3.1' } }
    expect(() => run(next({}, old))).toThrow('React 19 or newer is required.')
    const oldNext = { ...NEXT_PKG, dependencies: { ...NEXT_PKG.dependencies, next: '14.2.0' } }
    expect(() => run(next({}, oldNext))).toThrow('Next.js 15 or newer is required.')
  })

  it('reads the installed version from node_modules, walking up to a hoisted install', () => {
    const tree = next({ '/node_modules/react/package.json': '{"version":"19.4.0"}' })
    expect(run(tree).versions.react).toBe('19.4.0')
  })

  it('needs TypeScript', () => {
    const js = { ...NEXT_PKG, devDependencies: { tailwindcss: '4.3.3' } }
    expect(() => run(next({}, js))).toThrow('TopClass UI supports TypeScript projects only.')
  })

  it('needs Tailwind CSS 4.2, and only warns about a missing plugin', () => {
    const v3 = { ...NEXT_PKG, devDependencies: { ...NEXT_PKG.devDependencies, tailwindcss: '^3.4.0' } }
    expect(() => run(next({}, v3))).toThrow('Tailwind CSS v4.2 or newer is required: https://tailwindcss.com/docs/framework-guides/nextjs')
    const noPlugin = { ...NEXT_PKG, devDependencies: { typescript: '5.9.3', tailwindcss: '4.3.3' } }
    expect(run(next({}, noPlugin)).warnings).toEqual(['@tailwindcss/postcss is not in package.json; make sure Tailwind CSS runs over the copied files.'])
  })

  it('warns when no tsconfig include reaches the folder', () => {
    const project = run(next(), '/app', { dir: 'lib/ui' })
    expect(project.warnings).toEqual([])
    const narrow = next({ '/app/tsconfig.json': '{ "compilerOptions": { "moduleResolution": "bundler" }, "include": ["src/app"] }' })
    expect(run(narrow).warnings).toEqual(['No tsconfig include reaches src/topclassui/; add it, or the copies are not type-checked.'])
  })

  it('refuses node10 and classic resolution, and keeps .js under nodenext', () => {
    const node10 = next({ '/app/tsconfig.json': '{ "compilerOptions": { "moduleResolution": "node10" } }' })
    expect(() => run(node10)).toThrow('tsconfig.json must set "moduleResolution" to "bundler", "node16" or "nodenext".')
    const nodenext = next({ '/app/tsconfig.json': '{ "compilerOptions": { "module": "nodenext" } }' })
    expect(run(nodenext).moduleResolution).toBe('nodenext')
  })

  it('reads the alias the printed import lines use', () => {
    const project = run(next())
    expect(importBase(project.tsconfig, '/app', 'src/topclassui')).toBe('@/topclassui')
    const vp = run(vite(), '/v')
    expect(importBase(vp.tsconfig, '/v', 'src/topclassui')).toBe('./src/topclassui')
  })
})

describe('the CSS entry candidates', () => {
  it('takes the framework file that imports tailwindcss', () => {
    expect(cssCandidates(memoryFiles(next()), '/app', 'next-app')).toEqual(['src/app/globals.css'])
  })

  it('searches to depth 5 past node_modules when the usual files do not import it', () => {
    const tree = vite({
      '/v/src/index.css': 'body {}',
      '/v/src/styles/main.css': "@import 'tailwindcss';",
      '/v/src/styles/theme.css': '@import "tailwindcss" source(none);',
      '/v/node_modules/x/a.css': '@import "tailwindcss";',
    })
    expect(cssCandidates(memoryFiles(tree), '/v', 'vite-react')).toEqual(['src/styles/main.css', 'src/styles/theme.css'])
  })
})

describe('the package manager', () => {
  it('reads --pm, then packageManager walking up, then lockfiles walking up, then the user agent', () => {
    const files = memoryFiles({
      '/w/package.json': '{"packageManager":"pnpm@10.28.2"}',
      '/w/apps/a/package.json': '{}',
      '/x/yarn.lock': '',
      '/x/a/package.json': '{}',
    })
    expect(detectPackageManager(files, '/w/apps/a', {}, 'bun')).toEqual({ name: 'bun', source: '--pm' })
    expect(detectPackageManager(files, '/w/apps/a', {})).toEqual({ name: 'pnpm', source: 'packageManager in ../../package.json' })
    expect(detectPackageManager(files, '/x/a', {})).toEqual({ name: 'yarn', source: '../yarn.lock' })
  })

  it('prefers the lockfile to npx, whose user agent always says npm', () => {
    const files = memoryFiles({ '/p/package.json': '{}', '/p/pnpm-lock.yaml': '' })
    expect(detectPackageManager(files, '/p', { npm_config_user_agent: 'npm/10.9.4 node/v22.22.0' })).toEqual({ name: 'pnpm', source: 'pnpm-lock.yaml' })
    const bare = memoryFiles({ '/q/package.json': '{}' })
    expect(detectPackageManager(bare, '/q', { npm_config_user_agent: 'bun/1.3.0' })).toEqual({ name: 'bun', source: 'npm_config_user_agent' })
    expect(detectPackageManager(bare, '/q', {})).toEqual({ name: 'npm', source: 'default' })
  })
})

describe('the package in the same app', () => {
  it('finds topclassui in package.json or in an import', () => {
    const pkg = { ...NEXT_PKG, dependencies: { ...NEXT_PKG.dependencies, topclassui: '0.1.0' } }
    expect(usesPackage(memoryFiles(next({}, pkg)), run(next({}, pkg)))).toBe('topclassui is in package.json')
    const tree = next({ '/app/src/app/layout.tsx': "import { TopClassProvider } from 'topclassui/provider'" })
    expect(usesPackage(memoryFiles(tree), run(tree))).toBe('src/app/layout.tsx imports topclassui')
    expect(usesPackage(memoryFiles(next()), run(next()))).toBeNull()
  })
})

describe('tsconfig without the TypeScript API', () => {
  it('parses comments and trailing commas but keeps /* inside strings', () => {
    expect(parseJsonc('{ "paths": { "@/*": ["./src/*"], }, // c\n }')).toEqual({ paths: { '@/*': ['./src/*'] } })
  })

  it('follows extends and rebases inherited includes', () => {
    const files = memoryFiles({
      '/p/tsconfig.base.json': '{ "compilerOptions": { "moduleResolution": "nodenext", "paths": { "~/*": ["./src/*"] } }, "include": ["src"] }',
      '/p/apps/web/tsconfig.json': '{ "extends": "../../tsconfig.base.json" }',
    })
    const project = jsoncReader(files)('/p/apps/web/tsconfig.json')
    expect([project.moduleResolution, project.pathsBase, project.include]).toEqual(['nodenext', '/p', ['../../src']])
  })

  it('matches include patterns the way tsc does', () => {
    expect(includeMatcher('/a', 'src').test('/a/src/x/y.tsx')).toBe(true)
    expect(includeMatcher('/a', '**/*.tsx').test('/a/src/topclassui/components/x/index.tsx')).toBe(true)
    expect(includeMatcher('/a', '**/*.ts').test('/a/src/x.tsx')).toBe(false)
    expect(includeMatcher('/a', 'vite.config.ts').test('/a/src/x.ts')).toBe(false)
  })
})
