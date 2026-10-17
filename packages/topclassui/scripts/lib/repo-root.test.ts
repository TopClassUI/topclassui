import { describe, expect, it } from 'vitest'

import { WORKSPACE_FILE, findRepoRoot } from './repo-root.js'

// A fake disk, never the real one: the mutation runner copies the package into a temp folder
// with no workspace file above it, so a test that read the file system would fail in every mutant.
const FILES = new Set([
  '/repo/pnpm-workspace.yaml',
  '/repo/package.json',
  '/repo/packages/topclassui/package.json',
  '/repo/packages/topclassui/scripts/rules-sync.ts',
])
const exists = (path: string) => FILES.has(path.replaceAll('\\', '/'))

describe('findRepoRoot', () => {
  it('names the workspace file pnpm reads', () => {
    expect(WORKSPACE_FILE).toBe('pnpm-workspace.yaml')
  })

  it('walks up from the package folder to the folder holding pnpm-workspace.yaml', () => {
    expect(findRepoRoot('/repo/packages/topclassui', exists)).toBe('/repo')
  })

  it('walks up from a nested folder as well', () => {
    expect(findRepoRoot('/repo/packages/topclassui/scripts', exists)).toBe('/repo')
  })

  it('returns the start folder itself when it holds the workspace file', () => {
    expect(findRepoRoot('/repo', exists)).toBe('/repo')
  })

  it('returns null when no folder above holds the workspace file', () => {
    expect(findRepoRoot('/tmp/tc-mutate-abc/scripts', exists)).toBe(null)
  })

  it('stops at the file system root instead of looping', () => {
    expect(findRepoRoot('/', () => false)).toBe(null)
  })
})
