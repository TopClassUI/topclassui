// A tarball reader with no dependency: ustar headers are 512 bytes, the size is octal at byte 124.
import { gunzipSync } from 'node:zlib'

const BLOCK = 512

const text = (buffer: Buffer, start: number, length: number) =>
  buffer.subarray(start, start + length).toString('utf8').replace(/\0.*$/s, '')

/** Every regular file in a gzipped tar, by its path inside the archive. */
export function readTarball(gzipped: Buffer): Map<string, Buffer> {
  return parseTar(gunzipSync(gzipped))
}

/** Every regular file in a tar, by path; pax headers and directories are skipped. */
export function parseTar(tar: Buffer): Map<string, Buffer> {
  const files = new Map<string, Buffer>()
  let offset = 0
  let paxPath: string | null = null
  while (offset + BLOCK <= tar.length) {
    const header = tar.subarray(offset, offset + BLOCK)
    if (header.every((byte) => byte === 0)) break
    const size = parseInt(text(header, 124, 12).trim() || '0', 8)
    const type = text(header, 156, 1)
    const prefix = text(header, 345, 155)
    const name = text(header, 0, 100)
    const body = tar.subarray(offset + BLOCK, offset + BLOCK + size)
    if (type === 'x') {
      // A pax record reads "<length> path=<value>\n"; it names the next entry.
      paxPath = /(?:^|\n)\d+ path=([^\n]*)\n/.exec(body.toString('utf8'))?.[1] ?? null
    } else {
      if (type === '0' || type === '') files.set(paxPath ?? (prefix ? `${prefix}/${name}` : name), Buffer.from(body))
      paxPath = null
    }
    offset += BLOCK + Math.ceil(size / BLOCK) * BLOCK
  }
  return files
}
