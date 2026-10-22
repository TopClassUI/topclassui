// A token carries its role's class, not its two colours; globals.css sets each role's pair as lib/shiki-themes.ts draws it.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { highlight } from './highlight.js'
import { TOKEN_ROLES } from './shiki-themes.js'

const PAIRS = {
  text: ['#d4d4d4', '#262626'],
  comment: ['#a1a1a1', '#525252'],
  keyword: ['#51a2ff', '#1447e6'],
  string: ['#00d492', '#007a55'],
  attribute: ['#ffb900', '#973c00'],
  tag: ['#00bcff', '#0069a8'],
}

const CSS = readFileSync(resolve(import.meta.dirname, '..', 'app', 'globals.css'), 'utf8')

describe('highlight', () => {
  it('names each token by its role and marks a blank line and an import line', async () => {
    const markup = renderToStaticMarkup(await highlight("import { x } from 'y'\n\n// z", 'ts'))
    expect(markup).toBe(
      '<span class="shiki"><span data-import=""><span class="tk-keyword">import</span><span class="tk-text"> { x } </span><span class="tk-keyword">from</span><span class="tk-text"> </span><span class="tk-string">&#x27;y&#x27;</span>\n</span>'
      + '<span data-blank="">\n</span><span><span class="tk-comment">// z</span></span></span>',
    )
  })

  it('writes no style on a token', async () => {
    const markup = renderToStaticMarkup(await highlight('<Button variant="solid" />', 'tsx'))
    expect(markup).not.toContain('style=')
    expect(markup).toContain('<span class="tk-tag">Button</span>')
    expect(markup).toContain('<span class="tk-attribute">variant</span>')
  })

  it('takes each pair from the themes', () => {
    expect(TOKEN_ROLES).toEqual(PAIRS)
  })

  it('sets each pair on its class in globals.css', () => {
    for (const [role, [dark, light]] of Object.entries(PAIRS)) {
      expect(CSS).toContain(`.tk-${role} { --tc-code-on-dark: ${dark}; --tc-code-on-light: ${light}; }`)
    }
  })
})
