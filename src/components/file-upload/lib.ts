// Pure helpers: no React, no DOM. The hook and the tests call them.
import { FILE_UPLOAD_UNITS } from './constants.js'
import type { FileUploadLimits, FileUploadRejection, FileUploadSorted } from './types.js'

/** As the picker reads accept: `.ext` by the end of the name, `type/*` by the start of the MIME type, or an exact
 * MIME type, case apart. An empty accept takes every file. */
export function matchesAccept(file: Pick<File, 'name' | 'type'>, accept: string): boolean {
  const tokens = accept.split(',').map((token) => token.trim().toLowerCase()).filter(Boolean)
  if (tokens.length === 0) return true
  const [name, type] = [file.name.toLowerCase(), file.type.toLowerCase()]
  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}

/** The files after one pick or drop: the kept ones in order, up to maxFiles, and the refused ones with their reason.
 * With maxFiles 1 a new file replaces the one kept. */
export function sortFiles(current: readonly File[], incoming: readonly File[], { maxFiles, maxSize, accept }: FileUploadLimits): FileUploadSorted {
  const fresh: File[] = []
  const rejected: FileUploadRejection[] = []
  for (const file of incoming) {
    if (file.size > maxSize) rejected.push({ file, reason: 'tooLarge' })
    else if (!matchesAccept(file, accept)) rejected.push({ file, reason: 'wrongType' })
    else fresh.push(file)
  }
  if (maxFiles === 1 && fresh.length > 0) return { accepted: fresh.slice(0, 1), rejected, cut: fresh.length > 1 }
  const room = Math.max(0, maxFiles - current.length)
  return { accepted: [...current, ...fresh.slice(0, room)], rejected, cut: fresh.length > room }
}

/** A size in the reader's language and digits: bytes in full words below 1,024, then kB, MB or GB in steps of 1,024,
 * with one decimal at most. The short byte prints "300 byte" in Node 22 and Chromium, so the long one is used. */
export function formatBytes(bytes: number, locale: string, numberingSystem: string): string {
  if (bytes < 1024) return new Intl.NumberFormat(locale, { style: 'unit', unit: 'byte', unitDisplay: 'long', numberingSystem }).format(bytes)
  let value = bytes / 1024
  let step = 0
  while (value >= 1024 && step < FILE_UPLOAD_UNITS.length - 1) {
    value /= 1024
    step += 1
  }
  const unit = FILE_UPLOAD_UNITS[step] ?? 'gigabyte'
  return new Intl.NumberFormat(locale, { style: 'unit', unit, maximumFractionDigits: 1, numberingSystem }).format(value)
}
