// The rsc project, where React resolves its react-server build and has no client hooks.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AvatarFallback, AvatarImage, AvatarRoot, AvatarSkeleton } from '../index.js'

type Props = Record<string, unknown>
type Part = ((props: Props) => ReactNode) & { client?: string }

/** What a bundler leaves of a 'use client' export on the server: a reference that is never called there.
 * Hoisted with the mock, because the index above imports client.js before this file's own lines run. */
const { reference } = vi.hoisted(() => ({
  reference: (name: string): Part => Object.assign(() => { throw new Error(`${name} ran on the server`) }, { client: name }),
}))

// client.tsx starts with 'use client', so a Server Component only ever holds a reference to AvatarImage.
vi.mock('../client.js', () => ({ AvatarImage: reference('AvatarImage') }))

interface Crossing { part: string, props: Props }

/** Every client part a tree hands props to, in document order. A Server Component in between is run, as React would. */
function crossings(node: ReactNode, found: Crossing[] = []): Crossing[] {
  if (Array.isArray(node)) for (const child of node) crossings(child as ReactNode, found)
  else if (isValidElement(node)) {
    const { type, props } = node as ReactElement<Props>
    const part = typeof type === 'function' ? (type as Part) : undefined
    if (part?.client !== undefined) found.push({ part: part.client, props })
    else if (part) crossings(part(props), found)
    else crossings(props['children'] as ReactNode, found)
  }
  return found
}

/** The path of everything in a value that Flight cannot serialize: a function, a symbol, a class instance. */
function unserializable(value: unknown, path: string, found: string[] = []): string[] {
  if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') found.push(path)
  else if (Array.isArray(value)) value.forEach((item, index) => unserializable(item, `${path}[${String(index)}]`, found))
  else if (isValidElement(value)) {
    const element = value as ReactElement<Props>
    // A Server Component in a prop is run on the server: what crosses is what it returns, not its type.
    if (typeof element.type === 'function' && (element.type as Part).client === undefined) {
      unserializable((element.type as Part)(element.props), path, found)
    } else for (const [key, inner] of Object.entries(element.props)) unserializable(inner, `${path}.${key}`, found)
  } else if (value !== null && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype) found.push(path)
    else for (const [key, inner] of Object.entries(value)) unserializable(inner, `${path}.${key}`, found)
  }
  return found
}

interface ImageProps { src: string; alt: string; width: number; height: number; className?: string }

/** Stands in for next/image, which is not a dependency: a component that requires src and alt. */
function Image({ src, alt, width, height, className }: ImageProps) {
  return <img src={src} alt={alt} width={width} height={height} className={className} />
}

describe('an avatar with no image is all server: nothing in it crosses to the client', () => {
  it('initials named on the root run with no hook and hand no client part anything', () => {
    const tree = <AvatarRoot aria-label="Lina Haddad"><AvatarFallback>LH</AvatarFallback></AvatarRoot>
    expect(crossings(tree)).toEqual([])
  })

  it('the skeleton too', () => {
    expect(crossings(<AvatarSkeleton size="lg" />)).toEqual([])
  })

  it('the root and the fallback run here, where the reference that stands for the image would throw', () => {
    expect((AvatarRoot as Part).client).toBeUndefined()
    expect((AvatarFallback as Part).client).toBeUndefined()
    expect((AvatarImage as unknown as Part).client).toBe('AvatarImage')
  })
})

describe('an avatar with an image hands the client exactly one part, with what can cross (R-5.1-3)', () => {
  it('a plain img: AvatarImage, given two strings', () => {
    const tree = (
      <AvatarRoot size="lg">
        <AvatarImage src="/team/omar.jpg" alt="Omar Abed" />
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>
    )
    expect(crossings(tree)).toEqual([{ part: 'AvatarImage', props: { src: '/team/omar.jpg', alt: 'Omar Abed' } }])
  })

  it('next/image as render: the element crosses, and nothing in it is a function', () => {
    const found = crossings(<AvatarImage render={<Image src="/team/omar.jpg" alt="Omar Abed" width={48} height={48} />} />)
    expect(found.map((crossing) => crossing.part)).toEqual(['AvatarImage'])
    expect(found.flatMap(({ part, props }) => unserializable(props, part))).toEqual([])
  })

  it('the scan reports a handler, which a server page cannot hand a client part', () => {
    const found = crossings(<AvatarImage src="/a.jpg" alt="A" onError={() => undefined} />)
    expect(found.flatMap(({ part, props }) => unserializable(props, part))).toEqual(['AvatarImage.onError'])
  })
})

const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const load = async (name: string) => (await import(`../dummy/${name}.tsx`) as { default: () => ReactNode }).default

/** Per demo, the client parts its server render hands props to: one per picture, and nothing else. */
const CROSSES: Record<string, string[]> = {
  'basic': ['AvatarImage'],
  'custom-size': ['AvatarImage'],
  'failed': ['AvatarImage', 'AvatarImage', 'AvatarImage', 'AvatarImage', 'AvatarImage'],
  'icon': [],
  'playground': ['AvatarImage'],
  'rtl': ['AvatarImage'],
  'sizes': [],
  'skeleton': [],
  'states': ['AvatarImage'],
  'with-name': ['AvatarImage'],
}

describe('every demo is a Server Component, and only its pictures hydrate', () => {
  it('lists every demo, so a new one cannot skip the check', () => {
    expect(names).toEqual(Object.keys(CROSSES).sort())
  })

  for (const name of names) {
    it(`${name}: crosses into the client parts written here, each given only what can cross`, async () => {
      const found = crossings((await load(name))())
      expect(found.map((crossing) => crossing.part), name).toEqual(CROSSES[name])
      expect(found.flatMap(({ part, props }) => unserializable(props, part)), name).toEqual([])
    })
  }
})

describe('the reference stands in for the client module', () => {
  it('throws if anything on the server does call it', () => {
    expect(() => (AvatarImage as unknown as Part)({})).toThrow('AvatarImage ran on the server')
  })
})
