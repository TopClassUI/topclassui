import { readFileSync, realpathSync } from 'node:fs'
import { join } from 'node:path'

import { Toast } from '@base-ui/react/toast'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { hasLateUseClient, hasUseClient, importedModules } from '../../../scripts/lib/source-checks.js'
import { toastManager } from './manager.js'

const ROOT = process.cwd()
// The real folder: pnpm links the package, and its own dependencies sit beside the target.
const BASE_UI = realpathSync(join(ROOT, 'node_modules', '@base-ui', 'react'))
const read = (...path: string[]) => readFileSync(join(...path), 'utf8')

type Heard = Array<{ action: string; options: Record<string, unknown> }>

/** What Base UI's provider does with a manager: one listener, told of every call. */
function listen(manager: Pick<typeof toastManager, ' subscribe'> = toastManager) {
  const heard: Heard = []
  const stop = manager[' subscribe']((event) => { heard.push(event) })
  return { heard, stop }
}

/** A browser, as far as the manager asks: it keeps a call only where a document exists. */
const inBrowser = () => { vi.stubGlobal('document', {}) }

afterEach(() => { vi.unstubAllGlobals() })

describe('toastManager', () => {
  it('carries the four calls a toast API is built from', () => {
    expect(Object.keys(toastManager).map((key) => key.trim()).sort()).toEqual(['add', 'close', 'promise', 'subscribe', 'update'])
  })

  it('tells its listener of an add, and returns the id the toast was given', () => {
    const { heard, stop } = listen()
    const id = toastManager.add({ title: 'Saved', type: 'success' })
    stop()
    expect(id).toMatch(/^toast-\d+$/)
    expect(heard).toHaveLength(1)
    expect(heard[0]?.action).toBe('add')
    expect(heard[0]?.options).toEqual({ id, title: 'Saved', type: 'success', transitionStatus: 'starting' })
  })

  it('gives every add an id of its own', () => {
    const { stop } = listen()
    const first = toastManager.add({ title: 'One' })
    const second = toastManager.add({ title: 'Two', id: '' })
    stop()
    expect(second).not.toBe(first)
    expect(second).toMatch(/^toast-\d+$/)
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

  it('returns the promise the listener handed back, as Base UI does', async () => {
    const handled = Promise.resolve('handled')
    const stop = toastManager[' subscribe']((event) => { (event.options as { setPromise: (p: Promise<string>) => void }).setPromise(handled) })
    const given = toastManager.promise(Promise.resolve('given'), { loading: 'Saving', success: 'Saved', error: 'Failed' })
    stop()
    expect(await given).toBe('handled')
  })

  it('is one object for every importer, which is what makes it the manager of the app', async () => {
    const again = await import('./manager.js')
    expect(again.toastManager).toBe(toastManager)
  })
})

describe('toastManager keeps what comes before the provider listens (TOAST-1)', () => {
  it('in the browser, hands the first listener every call made while none listened, in order', () => {
    inBrowser()
    const id = toastManager.add({ title: 'Welcome back' })
    toastManager.update(id, { title: 'Welcome back, Omar' })
    toastManager.close('other')
    const first = listen()
    const second = listen()
    first.stop()
    second.stop()
    expect(first.heard).toEqual([
      { action: 'add', options: { id, title: 'Welcome back', transitionStatus: 'starting' } },
      { action: 'update', options: { id, updates: { title: 'Welcome back, Omar' } } },
      { action: 'close', options: { id: 'other' } },
    ])
    expect(second.heard).toEqual([])
  })

  it('a queued promise returns the caller its own, and catches the copy the provider hands back later', async () => {
    inBrowser()
    const own = Promise.resolve(1)
    expect(toastManager.promise(own, { loading: 'Saving', success: 'Saved', error: 'Failed' })).toBe(own)
    const copy = { catch: vi.fn() }
    const { stop } = listen({ ' subscribe': (listener) => toastManager[' subscribe']((event) => {
      (event.options as { setPromise: (p: unknown) => void }).setPromise(copy)
      listener(event)
    }) })
    stop()
    expect(copy.catch).toHaveBeenCalledOnce()
    expect(await own).toBe(1)
  })

  it('on the server, keeps nothing: no provider ever listens there, so a kept call would only pile up', () => {
    toastManager.add({ title: 'Nobody hears this' })
    const { heard, stop } = listen()
    stop()
    expect(heard).toEqual([])
  })
})

describe('toastManager emits what Base UI\'s own manager emits (R-0-1, read in @base-ui/react 1.8.0)', () => {
  it('reads the version these facts were checked against', () => {
    expect((JSON.parse(read(BASE_UI, 'package.json')) as { version: string }).version).toBe('1.8.0')
  })

  it('the same calls give the same events, the generated id aside', () => {
    const base = Toast.createToastManager()
    const theirs = listen(base)
    const ours = listen()
    for (const manager of [base, toastManager]) {
      manager.add({ title: 'Saved', type: 'success', priority: 'high' })
      manager.add({ id: 'upload', title: 'Uploading' })
      manager.update('upload', { title: 'Uploaded' })
      manager.close('upload')
      manager.close()
    }
    theirs.stop()
    ours.stop()
    const withoutGenerated = (heard: Heard) => heard.map((event, at) => (at === 0 ? { ...event, options: { ...event.options, id: 'generated' } } : event))
    expect(withoutGenerated(ours.heard)).toEqual(withoutGenerated(theirs.heard))
    expect(ours.heard).toHaveLength(5)
  })

  it('a promise event carries the promise and the setPromise the provider calls, as Base UI\'s does', () => {
    const base = Toast.createToastManager()
    const theirs = listen(base)
    const ours = listen()
    const waiting = Promise.resolve(1)
    const steps = { loading: 'Saving', success: 'Saved', error: 'Failed' }
    void base.promise(waiting, steps)
    void toastManager.promise(waiting, steps)
    theirs.stop()
    ours.stop()
    expect(Object.keys(ours.heard[0]?.options ?? {}).sort()).toEqual(Object.keys(theirs.heard[0]?.options ?? {}).sort())
    expect(ours.heard[0]?.options['promise']).toBe(waiting)
    expect(typeof ours.heard[0]?.options['setPromise']).toBe('function')
  })

  it('manager.ts has no client directive and imports nothing at run time: a plain object on the server too', () => {
    const source = read(import.meta.dirname, 'manager.ts')
    expect(hasUseClient(source)).toBe(false)
    expect(hasLateUseClient(source)).toBe(false)
    expect(importedModules(source)).toEqual(['@base-ui/react/toast'])
    expect(source).toMatch(/^import type \{[^}]*\} from '@base-ui\/react\/toast'$/m)
  })

  it('the provider subscribes in an effect, which runs after its children\'s: the reason for the queue', () => {
    expect(read(BASE_UI, 'toast', 'provider', 'ToastProvider.mjs')).toMatch(/React\.useEffect\(function subscribeToToastManager\(\)/)
  })
})
