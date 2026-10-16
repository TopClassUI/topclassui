// The mutations of the check scripts under scripts/ and of vitest.config.ts. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the contrast margin that absorbs browser differences is removed',
    file: 'scripts/lib/contrast-checks.ts',
    from: 'export const MARGIN = 0.15',
    to: 'export const MARGIN = 0',
  },
  {
    label: 'the 3:1 half of R-5.6-4 is skipped entirely',
    file: 'scripts/lib/contrast-checks.ts',
    from: '    if (ratio < min + MARGIN) {',
    to: '    if (ratio < min + MARGIN && min > 4.4) {',
  },
  {
    label: 'the gamut bracket takes the kinder reading',
    file: 'scripts/lib/contrast-checks.ts',
    from: '    return contrastRange(a, b).min',
    to: '    return contrastRange(a, b).max',
  },
  {
    label: 'the import graph stops walking past the first hop',
    file: 'scripts/lib/module-graph.ts',
    from: '      for (const edge of edges.get(next) ?? []) queue.push(edge)',
    to: '      if (next === entry) for (const edge of edges.get(next) ?? []) queue.push(edge)',
  },
  {
    label: 'the import scanner stops seeing a comment-prefixed import',
    file: 'scripts/lib/module-graph.ts',
    from: '  const code = blankComments(source)',
    to: '  const code = source',
  },
  {
    label: 'a vitest project loses its exclude, so a file runs twice',
    file: 'vitest.config.ts',
    from: '        exclude: project.exclude,',
    to: "        ...(project.name === 'node' ? {} : { exclude: project.exclude }),",
  },
  {
    label: 'the file-size walk stops descending, so a nested folder escapes',
    file: 'scripts/lib/file-sizes.ts',
    from: 'if (e.isDirectory()) out.push(...sourceFilesUnder(path))',
    to: 'if (e.isDirectory()) continue',
  },
  {
    label: 'the README stops saying a prop is required',
    file: 'scripts/lib/readme.ts',
    from: 'required: required.has(name),',
    to: 'required: false,',
  },
  {
    label: 'the README loses the hand-written prose on every rebuild',
    file: 'scripts/lib/readme.ts',
    from: "return body === '' ? PLACEHOLDER : body",
    to: 'return PLACEHOLDER',
  },
  {
    label: 'the README stops escaping a pipe, so the props table collapses',
    file: 'scripts/lib/readme.ts',
    from: "const cell = (text: string) => text.split('|').join('\\\\|')",
    to: 'const cell = (text: string) => text',
  },
  {
    label: 'the README of a part family imports the bare name again, which index.tsx does not export',
    file: 'scripts/lib/readme.ts',
    from: 'family ? familyImport(family) : ',
    to: '',
  },
  {
    label: 'the README of a part family says a Root that draws nothing passes attributes to its element',
    file: 'scripts/lib/readme-parts.ts',
    from: 'return family.rootDraws',
    to: 'return true',
  },
  {
    label: 'the README of a part family takes every Root for one that draws an element',
    file: 'scripts/lib/readme-types.ts',
    from: ".has('className') }",
    to: ".has('className') || true }",
  },
  {
    label: 'the README of a part family lists every schema prop under every part',
    file: 'scripts/lib/readme-types.ts',
    from: 'fromSchema.filter((row) => accepts.has(row.name))',
    to: 'fromSchema',
  },
  {
    label: 'a SCREAMING_CASE table can hide in any file again',
    file: 'scripts/lib/source-checks.ts',
    from: "return [...source.matchAll(re)].map((m) => m[1] ?? '')",
    to: 'return []',
  },
  {
    label: 'the mutation runner accepts an anchor found twice, so a row mutates only the first copy and the second goes untested',
    file: 'scripts/lib/mutate.ts',
    from: '    else if (found > 1) missing.push(',
    to: '    else if (found < 0) missing.push(',
  },
]
