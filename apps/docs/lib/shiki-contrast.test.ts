// Docs-site S3: every token colour of both Shiki themes reaches 4.5:1 plus the repo's margin on CodeBlock's surface.
import { codeToTokensBase } from 'shiki'
import { describe, expect, it } from 'vitest'

import { MARGIN } from '../../../packages/topclassui/scripts/lib/contrast-checks.js'
import { contrastOfHex, libraryFacts } from '../scripts/lib/facts.js'
import { ON_DARK, ON_LIGHT } from './shiki-themes.js'

const CORPUS: [string, string][] = [
  ['tsx', "import { Button } from 'topclassui/button'\n// a comment\nexport default async function Page({ id }: { id: string }) {\n  const n = 42 as const\n  return <Button variant=\"solid\" disabled={true} onClick={() => null}>{`x ${n}`}</Button>\n}"],
  ['ts', "type A = 'a' | 'b'\nconst re = /ab+c/gi; let t = true; null; undefined"],
  ['css', '/* c */\n@import "tailwindcss";\n:root { --tc-radius: 0.5rem; color: oklch(0.5 0.1 200); }\n@layer base { html { scroll-behavior: smooth !important; } }'],
  ['bash', '# install\nnpm i topclassui zod && pnpm add -D x --save $HOME'],
  ['json', '{ "a": 1, "b": [true, null, "s"] }'],
]

const { codeSurface } = libraryFacts()

async function colorsOf(theme: typeof ON_DARK): Promise<Set<string>> {
  const colors = new Set<string>()
  for (const [lang, code] of CORPUS) {
    const lines = await codeToTokensBase(code, { lang: lang as 'tsx', theme })
    for (const token of lines.flat()) if (token.color !== undefined && token.content.trim() !== '') colors.add(token.color.slice(0, 7).toLowerCase())
  }
  return colors
}

describe('the Shiki pair on CodeBlock', () => {
  const cases = [
    { theme: ON_DARK, modes: ['light', 'ocean'] as const },
    { theme: ON_LIGHT, modes: ['dark'] as const },
  ]
  for (const { theme, modes } of cases) {
    for (const mode of modes) {
      it(`${String(theme.name)} passes 4.5:1 plus the margin in ${mode}`, async () => {
        for (const color of await colorsOf(theme)) {
          expect(contrastOfHex(color, codeSurface[mode]), `${color} on ${codeSurface[mode]}`).toBeGreaterThanOrEqual(4.5 + MARGIN)
        }
      })
    }
  }
})
