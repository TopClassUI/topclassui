import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

const NEXT = dirname(createRequire(import.meta.url).resolve('next/package.json'))

function readNext(file: string): string {
  return readFileSync(join(NEXT, 'dist', file), 'utf8')
}

/** Every global Next's polyfill module patches, in the order the file patches them. */
function listPatches(source: string): string[] {
  const found = source.matchAll(/defineProperty\((\w+(?:\.prototype)?),"(\w+)"|\b([A-Z]\w*(?:\.prototype)?)\.(\w+)=(?!=)/g)
  return [...found].map((match) => (match[1] === undefined ? `${match[3]}.${match[4]}` : `${match[1]}.${match[2]}`))
}

describe("the stand-in for Next's polyfill module (next.config.ts resolveAlias)", () => {
  it('still matches the import Next makes, or the alias replaces nothing', () => {
    expect(readNext('esm/client/app-globals.js')).toContain("import '../build/polyfills/polyfill-module';")
    expect(readNext('client/app-globals.js')).toContain('require("../build/polyfills/polyfill-module");')
  })

  it('stands in for exactly these patches: a new one in a later Next must be checked against the browsers before it is dropped', () => {
    expect(listPatches(readNext('build/polyfills/polyfill-module.js'))).toEqual([
      'String.prototype.trimStart',
      'String.prototype.trimEnd',
      'Symbol.prototype.description',
      'Array.prototype.flat',
      'Array.prototype.flatMap',
      'Promise.prototype.finally',
      'Object.fromEntries',
      'Array.prototype.at',
      'Object.hasOwn',
      'URL.canParse',
    ])
  })

  it('adds URL.canParse where the browser lacks it', async () => {
    const native = Object.getOwnPropertyDescriptor(URL, 'canParse')
    Reflect.deleteProperty(URL, 'canParse')
    try {
      await import('./polyfills.js')
      expect(URL.canParse('https://topclassui.com/en')).toBe(true)
      expect(URL.canParse('/en', 'https://topclassui.com')).toBe(true)
      expect(URL.canParse('not a url')).toBe(false)
    } finally {
      if (native !== undefined) Object.defineProperty(URL, 'canParse', native)
    }
  })
})
