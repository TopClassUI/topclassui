import { type ReactNode, createElement } from 'react'
import { prerender } from 'react-dom/static'
import { describe, expect, it } from 'vitest'

import { clientPartOf, createServerBoxes } from './islands.js'

/** A server box: its island id, whether it is still in the page, and the attributes the island has set on it. */
function box(id: string, connected = true, attributes: string[] = []) {
  return {
    isConnected: connected,
    getAttribute: (name: string) => (name === 'data-island' ? id : null),
    hasAttribute: (name: string) => attributes.includes(name),
  }
}

/** A page with these boxes that counts how often it is searched. */
function page(readyState: string, boxes: ReturnType<typeof box>[]) {
  const searched: string[] = []
  return {
    searched,
    boxes,
    readyState,
    querySelectorAll: (selector: string) => {
      searched.push(selector)
      return [...boxes]
    },
  }
}

describe('createServerBoxes', () => {
  it('searches a parsed page once, whatever the number of islands that ask', () => {
    const parsed = page('complete', [box('_R_1_'), box('_R_2_')])
    const has = createServerBoxes(parsed)
    expect([has('_R_1_'), has('_R_2_'), has('_r_9_'), has('_R_1_')]).toEqual([true, true, false, true])
    expect(parsed.searched).toEqual(['[data-island]'])
  })

  it('answers false for a box an island has taken over or the page no longer holds', () => {
    const has = createServerBoxes(page('interactive', [box('_R_1_', true, ['data-island-mounted']), box('_R_2_', false), box('_R_3_')]))
    expect([has('_R_1_'), has('_R_2_'), has('_R_3_')]).toEqual([false, false, true])
  })

  it('searches again while the page is still loading, so a box parsed later is found', () => {
    const loading = page('loading', [box('_R_1_')])
    const has = createServerBoxes(loading)
    expect(has('_R_2_')).toBe(false)
    loading.boxes.push(box('_R_2_'))
    expect(has('_R_2_')).toBe(true)
    expect(loading.searched).toEqual(['[data-island]', '[data-island]'])
  })
})

/** The HTML a node renders to once every lazy part in it has loaded. */
async function html(node: ReactNode): Promise<string> {
  const { prelude } = await prerender(node, { onError: () => undefined })
  return new Response(prelude).text()
}

describe('clientPartOf', () => {
  it('gives every island of one loader the same part, so its chunk loads once and a part rendered again is already there', async () => {
    let loads = 0
    const load = () => {
      loads += 1
      return Promise.resolve(({ name }: { name: string }) => createElement('b', null, name))
    }
    const part = clientPartOf(load)
    expect(clientPartOf(load) === part).toBe(true)
    expect(await html(createElement(part, { name: 'one' }))).toBe('<b>one</b>')
    expect(await html(createElement(clientPartOf(load), { name: 'two' }))).toBe('<b>two</b>')
    expect(loads).toBe(1)
  })

  it('loads a chunk that failed again for the next island', async () => {
    let loads = 0
    const load = () => {
      loads += 1
      return loads === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(() => createElement('i', null, 'back'))
    }
    const failed = clientPartOf(load)
    await expect(html(createElement(failed))).rejects.toThrow('offline')
    expect(clientPartOf(load) === failed).toBe(false)
    expect(await html(createElement(clientPartOf(load)))).toBe('<i>back</i>')
    expect(loads).toBe(2)
  })
})
