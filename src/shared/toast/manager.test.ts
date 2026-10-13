import { readFileSync, realpathSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { hasLateUseClient, hasUseClient, importedModules } from '../../../scripts/lib/source-checks.js'
import { toastManager } from './manager.js'

const ROOT = process.cwd()
// The real folder: pnpm links the package, and its own dependencies sit beside the target.
const BASE_UI = realpathSync(join(ROOT, 'node_modules', '@base-ui', 'react'))
const read = (...path: string[]) => readFileSync(join(...path), 'utf8')

/** What Base UI's provider does with a manager: one listener, told of every call. */
function listen() {
  const heard: Array<{ action: string; options: Record<string, unknown> }> = []
  const stop = toastManager[' subscribe']((event) => { heard.push(event) })
  return { heard, stop }
}

describe('toastManager', () => {
  it('carries the four calls a toast API is built from', () => {
    expect(Object.keys(toastManager).map((key) => key.trim()).sort()).toEqual(['add', 'close', 'promise', 'subscribe', 'update'])
  })

  it('tells its listener of an add, and returns the id the toast was given', () => {
    const { heard, stop } = listen()
    const id = toastManager.add({ title: 'Saved', type: 'success' })
    stop()
    expect(id).toMatch(/^toast-/)
    expect(heard).toHaveLength(1)
    expect(heard[0]?.action).toBe('add')
    expect(heard[0]?.options).toMatchObject({ id, title: 'Saved', type: 'success' })
  })

  it('keeps an id the caller chose, which is how a second add updates the first', () => {
    const { heard, stop } = listen()
    expect(toastManager.add({ id: 'upload', title: 'Uploading' })).toBe('upload')
    stop()
    expect(heard[0]?.options['id']).toBe('upload')
  })

  it('tells its listener of a close and of an update, by id', () => {
    const { heard, stop } = listen()
    toastManager.update('upload', { title: 'Uploaded' })
    toastManager.close('upload')
    stop()
    expect(heard).toEqual([
      { action: 'update', options: { id: 'upload', updates: { title: 'Uploaded' } } },
      { action: 'close', options: { id: 'upload' } },
    ])
  })

  it('reaches nobody once the listener has left, and does not throw with none: add() before the provider mounts is lost', () => {
    const { heard, stop } = listen()
    stop()
    expect(() => toastManager.add({ title: 'Nobody hears this' })).not.toThrow()
    expect(heard).toEqual([])
  })

  it('is one object for every importer, which is what makes it the manager of the app', async () => {
    const again = await import('./manager.js')
    expect(again.toastManager).toBe(toastManager)
  })
})

describe('a plain function can call it (R-0-1, read in @base-ui/react 1.8.0)', () => {
  it('reads the version these facts were checked against', () => {
    expect((JSON.parse(read(BASE_UI, 'package.json')) as { version: string }).version).toBe('1.8.0')
  })

  it('manager.ts has no client directive, and imports Base UI by its toast entry only', () => {
    const source = read(import.meta.dirname, 'manager.ts')
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
    expect(importedModules(source)).toEqual(['@base-ui/react/toast'])
  })

  // The entry, the file it re-exports from, the function and the one helper it imports.
  for (const file of ['toast/index.mjs', 'toast/index.parts.mjs', 'toast/createToastManager.mjs', '../utils/generateId.mjs']) {
    it(`${file} carries no client directive, so createToastManager is a function on the server too`, () => {
      const source = read(BASE_UI, ...file.split('/'))
      expect(hasUseClient(source)).toBe(false)
      expect(hasLateUseClient(source)).toBe(false)
    })
  }

  it('createToastManager imports nothing of React, so building a manager runs no hook', () => {
    expect(importedModules(read(BASE_UI, 'toast', 'createToastManager.mjs'))).toEqual(['@base-ui/utils/generateId'])
  })

  it('the parts beside it do carry the directive, so the check above reads a real difference', () => {
    expect(hasUseClient(read(BASE_UI, 'toast', 'provider', 'ToastProvider.mjs'))).toBe(true)
    expect(hasUseClient(read(BASE_UI, 'toast', 'useToastManager.mjs'))).toBe(true)
  })
})
