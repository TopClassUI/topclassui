// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import type * as ReactModule from 'react'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there. */
const reference = (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name })

vi.mock('../client.js', () => ({ FileUpload: reference('FileUpload') }))
vi.mock('#shared/provider/provider.js', () => ({ TopClassProvider: reference('TopClassProvider') }))
vi.mock('#components/button/index.js', () => ({ Button: reference('Button') }))
vi.mock('#components/field/client.js', () => ({ FieldLive: reference('FieldLive') }))
// useId is the one hook the react-server build keeps, and it needs a render to run in: this walk calls Field by hand.
vi.mock('react', async (original) => ({ ...await original<typeof ReactModule>(), useId: () => '_r_rsc_' }))

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()

interface Crossing { part: string, props: Props }

/** Every client part a tree hands props to, in document order. A Server Component in between is run, as React would. */
function crossings(node: ReactNode, found: Crossing[] = []): Crossing[] {
  if (Array.isArray(node)) for (const child of node) crossings(child as ReactNode, found)
  else if (isValidElement(node)) {
    const { type, props } = node as ReactElement<Props>
    const part = typeof type === 'function' ? (type as Part) : undefined
    if (part?.client !== undefined) {
      found.push({ part: part.client, props })
      crossings(props['children'] as ReactNode, found)
    } else if (part) crossings(part(props), found)
    else crossings(props['children'] as ReactNode, found)
  }
  return found
}

/** The path of everything in a value that Flight cannot serialize: a function, a symbol, a class instance. */
function unserializable(value: unknown, path: string, found: string[] = []): string[] {
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') found.push(path)
  else if (Array.isArray(value)) value.forEach((item, index) => unserializable(item, `${path}[${String(index)}]`, found))
  else if (isValidElement(value)) {
    for (const [key, inner] of Object.entries((value as ReactElement<Props>).props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

describe('every demo is a Server Component that only hands FileUpload what can cross (R-5.1-3)', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(names).toEqual(['basic', 'form', 'in-field', 'multiple', 'rtl', 'states', 'ten-thousand'])
  })

  for (const name of names) {
    it(`${name}: runs with no hook, and passes no function, symbol or class instance to a client part`, async () => {
      const found = crossings((await load(name))())
      expect(found.filter(({ part }) => part === 'FileUpload').length, name).toBeGreaterThan(0)
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }

  it('the limits cross as plain numbers and the hint as text', async () => {
    const [upload] = crossings((await load('multiple'))())
    expect(upload?.props).toEqual({
      id: 'file-upload-multiple', name: 'attachments', accept: 'application/pdf,image/png', maxFiles: 5, maxSize: 5_242_880,
      children: 'PDF or PNG, up to 5 files',
    })
  })

  it('in-field: the server Field runs its function child, so only the control object crosses, as plain values', async () => {
    expect(crossings((await load('in-field'))())).toEqual([{
      part: 'FileUpload',
      props: {
        'id': '_r_rsc_', 'name': 'attachments', 'required': false, 'aria-labelledby': '_r_rsc_-label',
        'aria-describedby': '_r_rsc_-hint', 'aria-invalid': undefined, 'accept': 'application/pdf,image/png', 'maxFiles': 5,
        'maxSize': 5_242_880, 'children': 'Drop them here, 5 MB each',
      },
    }])
  })

  it('rtl: the upload sits inside the provider an island mounts', async () => {
    expect(crossings((await load('rtl'))()).map(({ part }) => part)).toEqual(['TopClassProvider', 'FileUpload'])
  })
})

describe('the scans see what they claim to', () => {
  it('a function, a symbol and a class instance are each reported by the path that holds them', () => {
    expect(unserializable({ on: () => undefined, when: new Date(0), mark: Symbol('x'), fine: [1, 'a'] }, 'FileUpload'))
      .toEqual(['FileUpload.on', 'FileUpload.when', 'FileUpload.mark'])
  })

  it('a reference throws if anything on the server does call it', () => {
    expect(() => reference('FileUpload')({})).toThrow('FileUpload ran on the server')
  })
})
