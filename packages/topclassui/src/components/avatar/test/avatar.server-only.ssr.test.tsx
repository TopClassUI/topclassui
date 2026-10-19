import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { buildGraph } from '../../../../scripts/lib/module-graph.js'
import { AvatarFallback, AvatarImage, AvatarRoot, AvatarSkeleton } from '../index.js'

// The client module throws if anything renders from it: an avatar of initials must never reach it.
vi.mock('../client.js', () => ({ AvatarImage: () => { throw new Error('AvatarImage ran') } }))

const ROOT = process.cwd()
const FOLDER = join(ROOT, 'src', 'components', 'avatar')
const SERVER = ['parts/avatar-root.tsx', 'parts/avatar-fallback.tsx', 'skeleton.tsx']
const ALL = [...SERVER, 'client.tsx', 'hook.ts', 'lib.ts', 'classes.ts', 'constants.ts', 'types.ts', 'schema.ts']

const graph = buildGraph([
  ...ALL.map((file) => join(FOLDER, file)),
  join(ROOT, 'src', 'shared', 'cn.ts'), join(ROOT, 'src', 'shared', 'render.ts'),
], ROOT)

const reached = (entry: string) => [...graph.reachable(join(FOLDER, entry))]
  .map((file) => relative(ROOT, file).split('\\').join('/')).sort()

const isClientModule = (file: string) => readFileSync(join(ROOT, file), 'utf8').startsWith("'use client'")

describe('an avatar of initials or an icon imports no client module', () => {
  for (const file of SERVER) {
    it(`${file} reaches no file that starts with 'use client', and React not at all`, () => {
      const files = reached(file)
      expect(files.filter(isClientModule), file).toEqual([])
      expect([...graph.packages(join(FOLDER, file))].sort(), file).toEqual(['clsx', 'tailwind-merge'])
    })
  }

  it('the image is the one part that does: client.tsx and its hook', () => {
    expect(reached('client.tsx').filter(isClientModule)).toEqual([
      'src/components/avatar/client.tsx', 'src/components/avatar/hook.ts',
    ])
    expect(graph.packages(join(FOLDER, 'client.tsx')).has('react')).toBe(true)
  })
})

describe('the server HTML of an avatar with no image is what it always was', () => {
  it('renders with the client module unusable, so no initials avatar calls into it', () => {
    const html = renderToString(
      <>
        <AvatarRoot aria-label="Lina Haddad"><AvatarFallback>LH</AvatarFallback></AvatarRoot>
        <AvatarSkeleton />
      </>,
    )
    expect(html).toBe(
      '<span data-size="md" class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-soft text-neutral-on-soft font-medium forced-colors:outline-(length:--tc-line-width) size-control-md text-base" role="img" aria-label="Lina Haddad">'
      + '<span aria-hidden="true" class="inline-flex items-center justify-center">LH</span></span>'
      + '<span class="inline-flex shrink-0 items-center justify-center rounded-full animate-pulse bg-neutral-soft motion-reduce:animate-none forced-colors:outline-(length:--tc-line-width) size-control-md text-base" aria-hidden="true">\u00a0</span>',
    )
  })

  it('the mock is live: an avatar with an image does reach it, so the test above can fail', () => {
    expect(() => renderToString(
      <AvatarRoot><AvatarImage src="/a.jpg" alt="A" /><AvatarFallback>OA</AvatarFallback></AvatarRoot>,
    )).toThrow('AvatarImage ran')
  })
})
