// R-5.12-2, applied to every source file rather than only the ones a component folder
// lists, so dummy/, parts/, shared/ and icons/ cannot outgrow the limit unseen.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const WARN_LINES = 200
export const FAIL_LINES = 300

/** Every .ts and .tsx file under dir, at any depth. */
export function sourceFilesUnder(dir: string): string[] {
  const out: string[] = []
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const path = join(dir, e.name)
    if (e.isDirectory()) out.push(...sourceFilesUnder(path))
    else if (/\.tsx?$/.test(e.name)) out.push(path)
  }
  return out
}

export function countLines(file: string): number {
  return readFileSync(file, 'utf8').split(/\r?\n/).length
}

export function sizeVerdict(lines: number): 'ok' | 'warn' | 'fail' {
  if (lines > FAIL_LINES) return 'fail'
  if (lines > WARN_LINES) return 'warn'
  return 'ok'
}
