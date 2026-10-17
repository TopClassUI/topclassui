import { describe, expect, it } from 'vitest'

import { attr, markup } from '#test/markup.js'
import { Alert } from '../index.js'

const BODY = '<div class="flex min-w-0 flex-1 flex-col gap-1 wrap-anywhere">'
const TITLE = '<p class="text-sm font-semibold">'
const DESCRIPTION = '<div class="text-sm">'
const ACTIONS = '<div class="flex flex-wrap gap-2 pt-1">'

/** Everything after the icon: the body column, exactly as rendered. */
const body = (source: string) => source.slice(source.indexOf(BODY))
const rootTag = (source: string) => /^<div[^>]*>/.exec(source)?.[0] ?? ''

describe('the three slots, in reading order', () => {
  it('stacks title, description and actions in one column, each in its own element', () => {
    const source = markup(<Alert icon={null} title="Trial ends" actions="Upgrade">Deploys pause.</Alert>)
    expect(body(source)).toBe(
      `${BODY}${TITLE}Trial ends</p>${DESCRIPTION}Deploys pause.</div>${ACTIONS}Upgrade</div></div></div>`,
    )
  })

  it('takes a node as the title, not only a string', () => {
    const source = markup(<Alert title={<>Trial <strong>ends</strong></>} />)
    expect(source).toContain(`${TITLE}Trial <strong>ends</strong></p>`)
  })

  it('never turns the title into the native tooltip attribute on the root', () => {
    expect(attr(rootTag(markup(<Alert title="Trial ends" />)), 'title')).toBeUndefined()
  })

  it('holds paragraphs and a list in the description, which is why it is a div', () => {
    const source = markup(<Alert><p>Three rows were skipped.</p><ul><li>Row 18</li></ul></Alert>)
    expect(source).toContain(`${DESCRIPTION}<p>Three rows were skipped.</p><ul><li>Row 18</li></ul></div>`)
  })

  it('lays the actions out in a wrapping row under the description', () => {
    const actions = <><button type="button">Retry</button><button type="button">Logs</button></>
    const source = markup(<Alert actions={actions}>Failed.</Alert>)
    expect(source).toContain(
      `${DESCRIPTION}Failed.</div>${ACTIONS}<button type="button">Retry</button><button type="button">Logs</button></div>`,
    )
  })

  it('renders a zero, which React prints as text', () => {
    expect(markup(<Alert title={0} />)).toContain(`${TITLE}0</p>`)
  })
})

describe('a missing slot leaves no element behind, so it opens no gap', () => {
  it('renders the title alone', () => {
    expect(body(markup(<Alert title="Saved" />))).toBe(`${BODY}${TITLE}Saved</p></div></div>`)
  })

  it('renders the description alone', () => {
    expect(body(markup(<Alert>Saved as you type.</Alert>))).toBe(`${BODY}${DESCRIPTION}Saved as you type.</div></div></div>`)
  })

  it('renders an empty body when there is nothing at all', () => {
    expect(body(markup(<Alert />))).toBe(`${BODY}</div></div>`)
  })

  const EMPTY = [
    ['false', false], ['true', true], ['an empty string', ''], ['null', null],
    ['an empty array', []], ['an array of nothing', [null, false, '', [undefined]]],
  ] as const
  for (const [name, empty] of EMPTY) {
    it(`treats ${name} as nothing in every slot`, () => {
      expect(body(markup(<Alert title={empty} actions={empty}>{empty}</Alert>)), name).toBe(`${BODY}</div></div>`)
    })
  }
})

describe('long text wraps; nothing truncates', () => {
  const LONG = 'https://example.com/projects/topclassui/deployments/2026-10-07/logs/build-step-four-of-six.txt'

  it('keeps every character, because a message is data and is never cut', () => {
    const source = markup(<Alert title={LONG}>{LONG}</Alert>)
    expect(source).toContain(`${TITLE}${LONG}</p>`)
    expect(source).toContain(`${DESCRIPTION}${LONG}</div>`)
  })

  it('breaks a word with no space in it, so a URL stays inside the box', () => {
    expect(markup(<Alert>{LONG}</Alert>)).toContain(BODY)
  })

  it('carries no truncate, line clamp or ellipsis anywhere', () => {
    expect(markup(<Alert title={LONG} actions="Open">{LONG}</Alert>)).not.toMatch(/truncate|line-clamp|text-ellipsis/)
  })
})
