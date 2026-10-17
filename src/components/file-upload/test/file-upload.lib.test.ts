import { describe, expect, it } from 'vitest'

import { formatBytes, matchesAccept, sortFiles } from '../lib.js'

const MB = 1024 * 1024
/** A file of a given size, its bytes left unset: only the size and the type are read. */
const fileOf = (name: string, type: string, size = 10) => {
  const file = new File([], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}
const names = (files: readonly File[]) => files.map((file) => file.name)
const LIMITS = { maxFiles: 3, maxSize: 5 * MB, accept: '' }

describe('matchesAccept reads accept as the picker does', () => {
  it('an extension by the end of the name, whatever its case', () => {
    expect(matchesAccept({ name: 'brief.pdf', type: '' }, '.PDF')).toBe(true)
    expect(matchesAccept({ name: 'BRIEF.PDF', type: '' }, '.pdf')).toBe(true)
    expect(matchesAccept({ name: 'brief.pdf.png', type: '' }, '.pdf')).toBe(false)
  })

  it('type/* by the start of the MIME type, and not a type that only starts with the same letters', () => {
    expect(matchesAccept({ name: 'a', type: 'image/png' }, 'image/*')).toBe(true)
    expect(matchesAccept({ name: 'a', type: 'application/pdf' }, 'image/*')).toBe(false)
    expect(matchesAccept({ name: 'a', type: 'imagery/png' }, 'image/*')).toBe(false)
  })

  it('an exact MIME type, among several tokens with spaces around them', () => {
    expect(matchesAccept({ name: 'a', type: 'application/pdf' }, 'application/pdf')).toBe(true)
    expect(matchesAccept({ name: 'a', type: 'image/png' }, ' application/pdf , image/png ')).toBe(true)
    expect(matchesAccept({ name: 'a.txt', type: 'text/plain' }, 'application/pdf,image/png')).toBe(false)
  })

  it('an empty accept, or one of commas and spaces, takes every file', () => {
    expect(matchesAccept({ name: 'a.exe', type: '' }, '')).toBe(true)
    expect(matchesAccept({ name: 'a.exe', type: '' }, ' , ')).toBe(true)
  })
})

describe('sortFiles', () => {
  it('keeps the order: the files kept first, then the new ones as they came', () => {
    const sorted = sortFiles([fileOf('a', '')], [fileOf('b', ''), fileOf('c', '')], LIMITS)
    expect(names(sorted.accepted)).toEqual(['a', 'b', 'c'])
    expect(sorted.cut).toBe(false)
  })

  it('cuts at maxFiles and says so', () => {
    const sorted = sortFiles([fileOf('a', '')], [fileOf('b', ''), fileOf('c', ''), fileOf('d', '')], LIMITS)
    expect(names(sorted.accepted)).toEqual(['a', 'b', 'c'])
    expect(sorted.rejected).toEqual([])
    expect(sorted.cut).toBe(true)
  })

  it('with the list full, a new file is cut', () => {
    const sorted = sortFiles([fileOf('a', ''), fileOf('b', ''), fileOf('c', '')], [fileOf('d', '')], LIMITS)
    expect([names(sorted.accepted), sorted.cut]).toEqual([['a', 'b', 'c'], true])
  })

  it('refuses a file over maxSize as too large, and keeps one exactly at it', () => {
    const sorted = sortFiles([], [fileOf('big', '', 6 * MB), fileOf('edge', '', 5 * MB)], LIMITS)
    expect(names(sorted.accepted)).toEqual(['edge'])
    expect(sorted.rejected.map(({ file, reason }) => [file.name, reason])).toEqual([['big', 'tooLarge']])
  })

  it('refuses a file accept does not take as the wrong type; too large is said first', () => {
    const sorted = sortFiles([], [fileOf('a.txt', 'text/plain'), fileOf('b.txt', 'text/plain', 6 * MB), fileOf('c.pdf', 'application/pdf')], {
      ...LIMITS, accept: 'application/pdf',
    })
    expect(names(sorted.accepted)).toEqual(['c.pdf'])
    expect(sorted.rejected.map(({ file, reason }) => [file.name, reason])).toEqual([['a.txt', 'wrongType'], ['b.txt', 'tooLarge']])
  })

  it('a refused file takes no room under maxFiles', () => {
    const sorted = sortFiles([fileOf('a', ''), fileOf('b', '')], [fileOf('big', '', 6 * MB), fileOf('c', '')], LIMITS)
    expect([names(sorted.accepted), sorted.cut]).toEqual([['a', 'b', 'c'], false])
  })

  it('with maxFiles 1 a new file replaces the one kept, and a second new one is cut', () => {
    const one = { ...LIMITS, maxFiles: 1 }
    expect(names(sortFiles([fileOf('old', '')], [fileOf('new', '')], one).accepted)).toEqual(['new'])
    const two = sortFiles([fileOf('old', '')], [fileOf('first', ''), fileOf('second', '')], one)
    expect([names(two.accepted), two.cut]).toEqual([['first'], true])
  })

  it('with maxFiles 1 a refused file leaves the one kept in place', () => {
    const sorted = sortFiles([fileOf('old', '')], [fileOf('big', '', 6 * MB)], { ...LIMITS, maxFiles: 1 })
    expect(names(sorted.accepted)).toEqual(['old'])
  })

  it('a pick of nothing keeps the list', () => {
    expect(names(sortFiles([fileOf('a', '')], [], LIMITS).accepted)).toEqual(['a'])
  })
})

describe('formatBytes', () => {
  it('in English: bytes in full words below 1024, then kB and MB in steps of 1024 with one decimal', () => {
    expect(formatBytes(300, 'en', 'latn')).toBe('300 bytes')
    expect(formatBytes(1, 'en', 'latn')).toBe('1 byte')
    expect(formatBytes(1023, 'en', 'latn')).toBe('1,023 bytes')
    expect(formatBytes(512 * 1024, 'en', 'latn')).toBe('512 kB')
    expect(formatBytes(2.4 * MB, 'en', 'latn')).toBe('2.4 MB')
    expect(formatBytes(1.5 * 1024 * MB, 'en', 'latn')).toBe('1.5 GB')
  })

  it('a size that rounds to 1,024 of a unit is written in the next unit up', () => {
    expect(formatBytes(1_048_575, 'en', 'latn')).toBe('1 MB')
    expect(formatBytes(1_073_741_823, 'en', 'latn')).toBe('1 GB')
    expect(formatBytes(1_048_575, 'ar', 'arab')).toBe('١ م.ب')
    expect(formatBytes(1_048_514, 'en', 'latn')).toBe('1,023.9 kB')
  })

  it('stays in gigabytes past 1024 of them', () => {
    expect(formatBytes(2048 * 1024 * MB, 'en', 'latn')).toBe('2,048 GB')
  })

  it('in Arabic: the Arabic unit names, in Latin digits or in Arabic-Indic ones', () => {
    expect(formatBytes(300, 'ar', 'latn')).toBe('300 بايت')
    expect(formatBytes(512 * 1024, 'ar', 'latn')).toBe('512 كيلوبايت')
    expect(formatBytes(2.4 * MB, 'ar', 'latn')).toBe('2.4 م.ب')
    expect(formatBytes(2.4 * MB, 'ar', 'arab')).toBe('٢٫٤ م.ب')
  })
})
