import { afterEach, describe, expect, it } from 'vitest'

import { findNeighbour, isTabStop, nearestOf, restoreFocus, tabStopsIn } from './focus-neighbour.js'

afterEach(() => { document.body.innerHTML = '' })

const byId = (id: string) => document.getElementById(id) as HTMLElement

describe('tabStopsIn', () => {
  it('lists the tab stops in document order and leaves out what Tab skips', () => {
    document.body.innerHTML = `
      <a id="link" href="#a">a</a><a id="bare">no href</a>
      <button id="button">b</button><button id="off" disabled>off</button>
      <input id="field"><input id="secret" type="hidden">
      <div id="minus" tabindex="-1">minus</div><div id="zero" tabindex="0">zero</div>
      <div inert><button id="inert">inert</button></div><div hidden><button id="hidden">hidden</button></div>`
    expect(tabStopsIn(document).map((element) => element.id)).toEqual(['link', 'button', 'field', 'zero'])
  })

  it('isTabStop refuses a negative tabindex and a disabled control', () => {
    document.body.innerHTML = '<span id="minus" tabindex="-1">m</span><button id="off" disabled>x</button><button id="on">y</button>'
    expect([isTabStop(byId('minus')), isTabStop(byId('off')), isTabStop(byId('on'))]).toEqual([false, false, true])
  })
})

describe('findNeighbour', () => {
  it('is the first tab stop after the element, never one inside it', () => {
    document.body.innerHTML = '<button id="before">b</button><div id="gone"><button>in</button></div><a id="after" href="#x">a</a>'
    expect(findNeighbour(byId('gone'))?.id).toBe('after')
  })

  it('is the last one before it when nothing follows', () => {
    document.body.innerHTML = '<button id="first">1</button><button id="second">2</button><div id="gone"><button>in</button></div>'
    expect(findNeighbour(byId('gone'))?.id).toBe('second')
  })

  it('is null when the page has no other stop', () => {
    document.body.innerHTML = '<div id="gone"><button>in</button></div><span>text</span>'
    expect(findNeighbour(byId('gone'))).toBeNull()
  })

  it('nearestOf picks among the candidates it is given', () => {
    document.body.innerHTML = '<button id="a">a</button><button id="gone">x</button><button id="b">b</button><button id="c">c</button>'
    expect(nearestOf(byId('gone'), [byId('a'), byId('c')])?.id).toBe('c')
    expect(nearestOf(byId('gone'), [byId('a')])?.id).toBe('a')
  })
})

describe('restoreFocus', () => {
  it('focuses the neighbour when the focus fell to the body', () => {
    document.body.innerHTML = '<button id="next">n</button>'
    restoreFocus(byId('next'), false)
    expect(document.activeElement?.id).toBe('next')
  })

  it('leaves a focus the caller already moved', () => {
    document.body.innerHTML = '<button id="next">n</button><button id="caller">c</button>'
    byId('caller').focus()
    restoreFocus(byId('next'), false)
    expect(document.activeElement?.id).toBe('caller')
  })

  it('does nothing for a neighbour that left the page, or none', () => {
    document.body.innerHTML = '<button id="next">n</button>'
    const next = byId('next')
    next.remove()
    restoreFocus(next, false)
    restoreFocus(null, false)
    expect(document.activeElement).toBe(document.body)
  })
})
