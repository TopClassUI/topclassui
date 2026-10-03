import { createHash } from 'node:crypto'
import { runInNewContext } from 'node:vm'

import { describe, expect, it } from 'vitest'

import { BUILT_IN_MODES, THEME_SCRIPT, THEME_STORAGE_KEY } from './script.js'

/** What a strict Content Security Policy needs, so a consumer stays fully static. */
function sha256(code: string) {
  return `'sha256-${createHash('sha256').update(code, 'utf8').digest('base64')}'`
}

describe('the theme script', () => {
  it('names every built-in mode, so a stored value can be validated', () => {
    for (const mode of BUILT_IN_MODES) expect(THEME_SCRIPT).toContain(`"${mode}"`)
  })

  it('reads the storage key the rest of the library writes', () => {
    expect(THEME_SCRIPT).toContain(THEME_STORAGE_KEY)
  })

  it('falls back to the system preference rather than guessing light', () => {
    expect(THEME_SCRIPT).toContain('prefers-color-scheme: dark')
  })

  it('swallows its own errors, since private mode can throw on localStorage', () => {
    expect(THEME_SCRIPT).toContain('try{')
    expect(THEME_SCRIPT).toContain('catch(e){}')
  })

  it('sets the attribute on the document element', () => {
    expect(THEME_SCRIPT).toContain('document.documentElement.dataset.theme')
  })

  it('has no line breaks, so a CSP hash is stable across checkouts', () => {
    expect(THEME_SCRIPT).not.toContain('\n')
    expect(THEME_SCRIPT).not.toContain('\r')
  })

  it('its hash is reproducible, which is what a CSP allows it by', () => {
    expect(sha256(THEME_SCRIPT)).toBe(sha256(THEME_SCRIPT))
    expect(sha256(THEME_SCRIPT)).toMatch(/^'sha256-[A-Za-z0-9+/]+={0,2}'$/)
  })
})

describe('what the script actually does', () => {
  interface FakeDoc { documentElement: { dataset: { theme?: string } } }

  function run(stored: string | null, prefersDark: boolean) {
    const document: FakeDoc = { documentElement: { dataset: {} } }
    runInNewContext(THEME_SCRIPT, {
      document,
      localStorage: { getItem: () => stored },
      matchMedia: () => ({ matches: prefersDark }),
    })
    return document.documentElement.dataset.theme
  }

  it('uses a stored mode that is still known', () => {
    expect(run('ocean', false)).toBe('ocean')
    expect(run('dark', false)).toBe('dark')
  })

  it('ignores a mode that no longer exists', () => {
    expect(run('sunset', false)).toBe('light')
    expect(run('sunset', true)).toBe('dark')
  })

  it('follows the system when nothing is stored', () => {
    expect(run(null, true)).toBe('dark')
    expect(run(null, false)).toBe('light')
  })

  it('treats the literal "system" as no choice', () => {
    expect(run('system', true)).toBe('dark')
  })

  it('does not throw when localStorage is blocked', () => {
    const document: FakeDoc = { documentElement: { dataset: {} } }
    const blocked = () => {
      runInNewContext(THEME_SCRIPT, {
        document,
        localStorage: { getItem: () => { throw new Error('blocked') } },
        matchMedia: () => ({ matches: false }),
      })
    }
    expect(blocked).not.toThrow()
  })
})
