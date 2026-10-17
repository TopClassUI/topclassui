// The release plan's exports map (release.md section 4), used only while the library's package.json has none.
import type { ExportsMap } from '../../lib/rewrite-imports.js'

const entry = (path: string) => ({ types: `./dist/${path}.d.ts`, default: `./dist/${path}.js` })

export const PLANNED_EXPORTS: ExportsMap = {
  './package.json': './package.json',
  './styles.css': './dist/styles.css',
  './tokens.css': './dist/tokens.css',
  './provider': entry('shared/provider/provider'),
  './theme': entry('shared/theme/theme-script'),
  './cn': entry('shared/cn'),
  './classes': entry('shared/classes'),
  './labels/*': entry('shared/labels/*'),
  './icons': entry('icons/index'),
  './icons/*': entry('icons/data/*'),
  './schemas/*': entry('components/*/schema'),
  './meta/*': entry('components/*/meta'),
  './*': entry('components/*/index'),
}
