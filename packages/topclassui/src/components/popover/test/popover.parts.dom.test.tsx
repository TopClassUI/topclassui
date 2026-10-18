import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverPopupProps } from '../types.js'

/** An open popover with whatever the popup is given. */
async function popup(props: PopoverPopupProps = {}, children: ReactNode = <PopoverTitle>Share this page</PopoverTitle>) {
  const view = render(
    <PopoverRoot defaultOpen>
      <PopoverTrigger render={<Button>Share</Button>} />
      <PopoverPopup {...props}>{children}</PopoverPopup>
    </PopoverRoot>,
  )
  return { ...view, element: await screen.findByRole('dialog') }
}

const classes = (element: Element | null | undefined) => (element?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)

describe('PopoverPopup passes the rest of its props to the popup (R-5.7-3)', () => {
  it('an id, an aria-label, a lang and a data attribute land on the dialog itself', async () => {
    const { element } = await popup({ 'id': 'share', 'aria-label': 'Share', 'lang': 'fr', 'data-testid': 'p' } as PopoverPopupProps)
    expect(element.id).toBe('share')
    expect(element.getAttribute('aria-label')).toBe('Share')
    expect(element.getAttribute('lang')).toBe('fr')
    expect(element.getAttribute('data-testid')).toBe('p')
  })

  it('a style lands there too, beside nothing of ours', async () => {
    const { element } = await popup({ style: { '--tc-radius': '0px' } as PopoverPopupProps['style'] })
    expect(element.style.getPropertyValue('--tc-radius')).toBe('0px')
  })

  it('wears its own classes: the width, the two caps, the column, the scroll area and the inset ring', async () => {
    const list = classes((await popup()).element)
    for (const cls of [
      'w-70', 'max-w-[round(down,var(--available-width),1px)]', 'max-h-(--available-height)', 'flex', 'flex-col', 'gap-3', 'p-4', '*:shrink-0',
      'wrap-anywhere', 'overflow-y-auto', 'overscroll-contain', 'rounded-box', 'bg-surface-raised', 'shadow-lg',
      'focus-visible:-outline-offset-(length:--tc-ring-width)',
    ]) expect(list, cls).toContain(cls)
  })

  it('a className comes last, so w-96 and p-2 replace the width and the padding of the popup', async () => {
    const list = classes((await popup({ className: 'w-96 p-2' })).element)
    expect(list).toContain('w-96')
    expect(list).toContain('p-2')
    expect(list).not.toContain('w-70')
    expect(list).not.toContain('p-4')
    // What conflicts with nothing stays.
    expect(list).toContain('max-h-(--available-height)')
  })

  it('reports its placement as a design attribute, bottom when none is given', async () => {
    expect((await popup()).element.getAttribute('data-placement')).toBe('bottom')
  })

  it('and the one it was given', async () => {
    expect((await popup({ placement: 'end-top' })).element.getAttribute('data-placement')).toBe('end-top')
  })

  it('renders its children inside the dialog, in order', async () => {
    const { element } = await popup({}, <><PopoverTitle>One</PopoverTitle><PopoverDescription>Two</PopoverDescription><span>Three</span></>)
    expect([...element.children].map((child) => `${child.tagName} ${child.textContent}`)).toEqual(['H2 One', 'P Two', 'SPAN Three'])
  })
})

describe('the positioner around it is ours alone', () => {
  it('carries the layer and the class that hides it once its trigger has scrolled away', async () => {
    const { element } = await popup()
    expect(classes(element.parentElement)).toEqual(['z-(--tc-z-popup)', 'data-anchor-hidden:invisible'])
    expect(element.parentElement?.getAttribute('role')).toBe('presentation')
  })

  it('takes none of the rest props: an id of the caller is on the popup and not on the positioner', async () => {
    const { element } = await popup({ id: 'share' })
    expect(element.parentElement?.id).toBe('')
  })

  it('reports the side and the alignment Base UI resolved, for a style of the caller to read', async () => {
    const { element } = await popup({ placement: 'top-start' })
    expect(element.parentElement?.getAttribute('data-side')).toBe('top')
    expect(element.parentElement?.getAttribute('data-align')).toBe('start')
  })
})

describe('the two props of the portal', () => {
  it('container mounts the popup inside the element it names', async () => {
    const host = document.createElement('section')
    document.body.appendChild(host)
    const { element } = await popup({ container: host })
    expect(host.contains(element)).toBe(true)
    host.remove()
  })

  it('without keepMounted a closed popover leaves nothing in the document', () => {
    render(
      <PopoverRoot>
        <PopoverTrigger render={<Button>Share</Button>} />
        <PopoverPopup><PopoverTitle>Share this page</PopoverTitle></PopoverPopup>
      </PopoverRoot>,
    )
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('with keepMounted it stays in the document, hidden, with its scope already written', () => {
    render(
      <PopoverRoot>
        <PopoverTrigger render={<Button>Share</Button>} />
        <PopoverPopup keepMounted><PopoverTitle>Share this page</PopoverTitle></PopoverPopup>
      </PopoverRoot>,
    )
    const element = document.querySelector('[role="dialog"]')
    expect(element?.textContent).toBe('Share this page')
    expect(element?.parentElement?.hasAttribute('hidden')).toBe(true)
    expect(element?.getAttribute('data-popover')).not.toBe('')
  })

  it('neither one is written on the popup as an attribute', async () => {
    const { element } = await popup({ keepMounted: true, container: document.body })
    expect(element.getAttributeNames().sort().filter((name) => !name.startsWith('aria-') && !name.startsWith('data-'))).toEqual([
      'class', 'id', 'role', 'tabindex',
    ])
  })
})

describe('PopoverTitle and PopoverDescription', () => {
  it('the title is a small semibold line in the body colour, and the description is muted', async () => {
    const { element } = await popup({}, <><PopoverTitle>One</PopoverTitle><PopoverDescription>Two</PopoverDescription></>)
    expect(classes(element.querySelector('h2'))).toEqual(['text-sm', 'font-semibold', 'text-body'])
    expect(classes(element.querySelector('p'))).toEqual(['text-sm', 'text-muted'])
  })

  it('each takes a className last, an id and a ref', async () => {
    const title = { current: null as HTMLHeadingElement | null }
    const text = { current: null as HTMLParagraphElement | null }
    const { element } = await popup({}, (
      <>
        <PopoverTitle ref={title} id="t" className="text-base">One</PopoverTitle>
        <PopoverDescription ref={text} id="d" className="text-body">Two</PopoverDescription>
      </>
    ))
    expect(title.current).toBe(element.querySelector('h2'))
    expect(text.current).toBe(element.querySelector('p'))
    expect(classes(title.current)).toEqual(['font-semibold', 'text-body', 'text-base'])
    expect(classes(text.current)).toEqual(['text-sm', 'text-body'])
    // An id of the caller is the one the popup is named and described by.
    expect(element.getAttribute('aria-labelledby')).toBe('t')
    expect(element.getAttribute('aria-describedby')).toBe('d')
  })

  it('the title can be another heading level through render', async () => {
    const { element } = await popup({}, <PopoverTitle render={<h3 />}>One</PopoverTitle>)
    expect(element.querySelector('h3')?.textContent).toBe('One')
    expect(element.querySelector('h2')).toBeNull()
  })
})

describe('with no title', () => {
  it('the popup has no name of its own, so the caller gives it one with aria-label', async () => {
    const { element } = await popup({ 'aria-label': 'Filters' }, <PopoverClose render={<Button>Done</Button>} />)
    expect(element.hasAttribute('aria-labelledby')).toBe(false)
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBe(element)
  })
})
