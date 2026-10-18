import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import { parseTar, readTarball } from './tar.js'

/** One ustar header and body, padded to 512-byte blocks, as every tar writer emits them. */
function entry(name: string, body: string, type = '0', prefix = ''): Buffer {
  const header = Buffer.alloc(512)
  header.write(name, 0, 'utf8')
  header.write(Buffer.byteLength(body).toString(8).padStart(11, '0'), 124, 'utf8')
  header.write(type, 156, 'utf8')
  header.write('ustar', 257, 'utf8')
  header.write(prefix, 345, 'utf8')
  const padded = Buffer.alloc(Math.ceil(Buffer.byteLength(body) / 512) * 512)
  padded.write(body, 0, 'utf8')
  return Buffer.concat([header, padded])
}

const END = Buffer.alloc(1024)

describe('parseTar', () => {
  it('reads each regular file by its path and content', () => {
    const files = parseTar(Buffer.concat([entry('package/package.json', '{"name":"x"}'), entry('package/dist/a.js', 'export {}\n'), END]))
    expect([...files.keys()]).toEqual(['package/package.json', 'package/dist/a.js'])
    expect(files.get('package/dist/a.js')?.toString('utf8')).toBe('export {}\n')
  })

  it('joins the ustar prefix to the name, which is how a path over 100 characters is stored', () => {
    const files = parseTar(Buffer.concat([entry('index.js', 'x', '0', 'package/dist/components/segmented-control/parts'), END]))
    expect([...files.keys()]).toEqual(['package/dist/components/segmented-control/parts/index.js'])
  })

  it('takes the path of a pax header for the entry that follows it, and never lists the header itself', () => {
    const pax = '43 path=package/dist/long/name/from/pax.js\n'
    const files = parseTar(Buffer.concat([entry('././@PaxHeader', pax, 'x'), entry('package/dist/short.js', 'y'), END]))
    expect([...files.keys()]).toEqual(['package/dist/long/name/from/pax.js'])
    expect(files.get('package/dist/long/name/from/pax.js')?.toString('utf8')).toBe('y')
  })

  it('skips a directory entry and stops at the end blocks', () => {
    const files = parseTar(Buffer.concat([entry('package/dist/', '', '5'), entry('package/dist/b.js', 'b'), END, entry('ghost.js', 'g')]))
    expect([...files.keys()]).toEqual(['package/dist/b.js'])
  })

  it('reads a body that is not a whole block, then the entry after it', () => {
    const files = parseTar(Buffer.concat([entry('a.txt', 'abc'), entry('b.txt', 'de'), END]))
    expect(files.get('a.txt')?.toString('utf8')).toBe('abc')
    expect(files.get('b.txt')?.toString('utf8')).toBe('de')
  })
})

describe('readTarball', () => {
  it('gunzips, then reads', () => {
    const files = readTarball(gzipSync(Buffer.concat([entry('package/README.md', '# x\n'), END])))
    expect(files.get('package/README.md')?.toString('utf8')).toBe('# x\n')
  })
})
