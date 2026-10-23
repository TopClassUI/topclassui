import { type ReactNode, createElement } from 'react'
import { prerender } from 'react-dom/static'
import { describe, expect, it } from 'vitest'

import { FIRST, type Turn, clientPartOf, createServerBoxes, createTurns, rankNear } from './islands.js'

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

/** A clock the test runs by hand: paint() lets every waiting frame paint, expire() runs every timer. */
function clock() {
  const paints: (() => void)[] = []
  const timers: { next: () => void; ms: number }[] = []
  return {
    timers,
    afterPaint: (next: () => void) => { paints.push(next) },
    later: (next: () => void, ms: number) => { timers.push({ next, ms }) },
    paint: () => { for (const next of paints.splice(0)) next() },
    expire: () => { for (const { next } of timers.splice(0)) next() },
  }
}

/** A turn that logs its swap and hands its `end` to the test. */
function turn(name: string, rank: number, log: string[], ends: Map<string, () => void>): Turn {
  return { rank, swap: (end) => { log.push(name); ends.set(name, end) } }
}

describe('createTurns', () => {
  it('lets one island take over at a time, the next after it has ended and the frame has painted', () => {
    const time = clock()
    const take = createTurns(time, 1000)
    const log: string[] = []
    const ends = new Map<string, () => void>()
    take(turn('a', 0, log, ends))
    take(turn('b', 0, log, ends))
    take(turn('c', 0, log, ends))
    expect(log).toEqual(['a'])
    ends.get('a')?.()
    expect(log).toEqual(['a'])
    time.paint()
    expect(log).toEqual(['a', 'b'])
    ends.get('b')?.()
    time.paint()
    expect(log).toEqual(['a', 'b', 'c'])
  })

  it('chooses the lowest rank when a turn ends, read then, and keeps the order of arrival between equal ranks', () => {
    const time = clock()
    const take = createTurns(time, 1000)
    const log: string[] = []
    const ends = new Map<string, () => void>()
    take(turn('running', 0, log, ends))
    const late = { ...turn('pressed while waiting', 5, log, ends) }
    take(turn('near', 2, log, ends))
    take(late)
    take(turn('near too', 2, log, ends))
    late.rank = FIRST
    for (const name of ['running', 'pressed while waiting', 'near', 'near too']) {
      ends.get(name)?.()
      time.paint()
    }
    expect(log).toEqual(['running', 'pressed while waiting', 'near', 'near too'])
  })

  it('lets the next island go when a turn outlasts the limit, and a late end starts nothing more', () => {
    const time = clock()
    const take = createTurns(time, 1000)
    const log: string[] = []
    const ends = new Map<string, () => void>()
    take(turn('slow', 0, log, ends))
    take(turn('next', 0, log, ends))
    take(turn('last', 0, log, ends))
    expect(time.timers.map(({ ms }) => ms)).toEqual([1000])
    time.expire()
    time.paint()
    expect(log).toEqual(['slow', 'next'])
    ends.get('slow')?.()
    ends.get('slow')?.()
    time.paint()
    expect(log).toEqual(['slow', 'next'])
  })

  it('starts the next island at once when the queue had run dry', () => {
    const time = clock()
    const take = createTurns(time, 1000)
    const log: string[] = []
    const ends = new Map<string, () => void>()
    take(turn('a', 0, log, ends))
    ends.get('a')?.()
    time.paint()
    take(turn('b', 0, log, ends))
    expect(log).toEqual(['a', 'b'])
  })
})

describe('rankNear', () => {
  it('puts the latest report first, and in one report the island nearest a 800 px screen first', () => {
    expect(rankNear(2, 900, 1300, 800)).toBe(-1_999_900)
    expect(rankNear(2, 100, 400, 800)).toBe(-2_000_000)
    expect(rankNear(2, -700, -300, 800)).toBe(-1_999_700)
    expect(rankNear(1, 100, 400, 800)).toBe(-1_000_000)
  })
})
