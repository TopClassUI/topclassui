import { runInNewContext } from 'node:vm'

import { describe, expect, it } from 'vitest'

import { candidatesIn } from './harness.js'
import {
  CLIENT_ENTRY, EDGES, ERROR_BOX, LIVE_HOST, LIVE_PORT, PORT_ENV, SHELL_CANDIDATES, SHELL_CSS,
  demoModule, hydrateScript, liveOrigin, livePageHtml, livePort, parseRoute, routeFor, trapScript,
} from './live-harness.js'

describe('the address of the live harness', () => {
  it('is one fixed port on the IPv4 loopback, so a spec can name it', () => {
    expect(LIVE_PORT).toBe(4517)
    expect(LIVE_HOST).toBe('127.0.0.1')
    expect(livePort({})).toBe(4517)
    expect(liveOrigin(4517)).toBe('http://127.0.0.1:4517')
  })

  it('moves to the port of TC_HARNESS_PORT, which a second worktree sets for its server and its tests', () => {
    expect(PORT_ENV).toBe('TC_HARNESS_PORT')
    expect(livePort({ TC_HARNESS_PORT: '4600' })).toBe(4600)
    expect(liveOrigin(livePort({ TC_HARNESS_PORT: '4600' }))).toBe('http://127.0.0.1:4600')
    expect(livePort({ TC_HARNESS_PORT: '' })).toBe(4517)
  })

  it('refuses a value that is no usable port, by name, instead of listening somewhere else', () => {
    for (const bad of ['abc', '80', '70000', '4517.5', '-1']) {
      expect(() => livePort({ TC_HARNESS_PORT: bad }), bad)
        .toThrow(`harness: TC_HARNESS_PORT="${bad}" is not a port between 1024 and 65535`)
    }
  })
})

describe('the route of a live page', () => {
  it('is the file name of the static page', () => {
    expect(routeFor('tooltip--basic', 'light', 'ltr')).toBe('/tooltip--basic--light--ltr.html')
    expect(routeFor('avatar-group--four', 'ocean', 'rtl', {})).toBe('/avatar-group--four--ocean--rtl.html')
  })

  it('carries the edge and the height as parameters', () => {
    expect(routeFor('tooltip--basic', 'dark', 'rtl', { edge: 'start' })).toBe('/tooltip--basic--dark--rtl.html?edge=start')
    expect(routeFor('tooltip--basic', 'light', 'ltr', { tall: true })).toBe('/tooltip--basic--light--ltr.html?tall=1')
    expect(routeFor('tooltip--basic', 'light', 'ltr', { edge: 'bottom', tall: true }))
      .toBe('/tooltip--basic--light--ltr.html?edge=bottom&tall=1')
    expect(routeFor('tooltip--basic', 'light', 'ltr', { tall: false })).toBe('/tooltip--basic--light--ltr.html')
  })

  it('names the four edges, the inline two by direction and not by side', () => {
    expect(EDGES).toEqual(['top', 'bottom', 'start', 'end'])
  })
})

describe('parsing a request', () => {
  it('reads the demo, the mode and the direction out of the file name', () => {
    expect(parseRoute('/tooltip--basic--light--ltr.html'))
      .toEqual({ demo: 'tooltip--basic', mode: 'light', direction: 'ltr', edge: null, tall: false })
    expect(parseRoute('/avatar-group--long-label--ocean--rtl.html'))
      .toEqual({ demo: 'avatar-group--long-label', mode: 'ocean', direction: 'rtl', edge: null, tall: false })
  })

  it('reads the two parameters', () => {
    expect(parseRoute('/tooltip--basic--dark--rtl.html?edge=end&tall=1'))
      .toEqual({ demo: 'tooltip--basic', mode: 'dark', direction: 'rtl', edge: 'end', tall: true })
    expect(parseRoute('/tooltip--basic--dark--rtl.html?edge=top'))
      .toEqual({ demo: 'tooltip--basic', mode: 'dark', direction: 'rtl', edge: 'top', tall: false })
  })

  it('leaves everything that is no page to Vite', () => {
    expect(parseRoute('/')).toBeNull()
    expect(parseRoute('/src/components/tooltip/dummy/basic.tsx')).toBeNull()
    expect(parseRoute('/scripts/lib/live-client.tsx?v=1')).toBeNull()
    expect(parseRoute('/node_modules/.vite/harness-1/deps/react.js?v=abc')).toBeNull()
  })

  it('refuses a parameter it does not know, so a misspelt one cannot pass as an unpinned page', () => {
    expect(parseRoute('/tooltip--basic--light--ltr.html?egde=top'))
      .toEqual({ error: '"egde" is not a parameter; a page takes edge and tall' })
    expect(parseRoute('/tooltip--basic--light--ltr.html?edge=top&pin=1'))
      .toEqual({ error: '"pin" is not a parameter; a page takes edge and tall' })
  })

  it('refuses a physical side: the edges are top, bottom, start and end', () => {
    expect(parseRoute('/tooltip--basic--light--ltr.html?edge=left'))
      .toEqual({ error: 'the edge "left" is not one of top, bottom, start, end' })
    expect(parseRoute('/tooltip--basic--light--ltr.html?edge='))
      .toEqual({ error: 'the edge "" is not one of top, bottom, start, end' })
  })

  it('takes tall=1 and nothing else', () => {
    expect(parseRoute('/tooltip--basic--light--ltr.html?tall=yes')).toEqual({ error: 'tall takes 1 and nothing else, not "yes"' })
    expect(parseRoute('/tooltip--basic--light--ltr.html?tall=0')).toEqual({ error: 'tall takes 1 and nothing else, not "0"' })
  })

  it('says which part of a page name is wrong', () => {
    expect(parseRoute('/tooltip--basic--sepia--ltr.html')).toEqual({ error: 'the mode "sepia" is not one of light, dark, ocean' })
    expect(parseRoute('/tooltip--basic--light--up.html')).toEqual({ error: 'the direction "up" is not one of ltr, rtl' })
    expect(parseRoute('/tooltip--light--ltr.html'))
      .toEqual({ error: '"/tooltip--light--ltr.html" is not <folder>--<demo>--<mode>--<direction>.html' })
    expect(parseRoute('/index.html')).toEqual({ error: '"/index.html" is not <folder>--<demo>--<mode>--<direction>.html' })
  })

  it('reads back every route it writes', () => {
    expect(parseRoute(routeFor('table--in-a-layout', 'ocean', 'rtl', { edge: 'bottom', tall: true })))
      .toEqual({ demo: 'table--in-a-layout', mode: 'ocean', direction: 'rtl', edge: 'bottom', tall: true })
  })
})

describe('the modules a page loads', () => {
  it('imports the demo from its own source file', () => {
    expect(demoModule('tooltip--basic')).toBe('/src/components/tooltip/dummy/basic.tsx')
    expect(demoModule('avatar-group--long-label')).toBe('/src/components/avatar-group/dummy/long-label.tsx')
  })

  it('hydrates that demo with the direction and the locale of the page', () => {
    expect(CLIENT_ENTRY).toBe('/scripts/lib/live-client.tsx')
    expect(hydrateScript({ demo: 'tooltip--rtl', direction: 'rtl' })).toBe([
      'import { hydrateDemo } from "/scripts/lib/live-client.tsx"',
      'import Demo from "/src/components/tooltip/dummy/rtl.tsx"',
      'hydrateDemo(Demo, "rtl", "ar")',
    ].join('\n'))
    expect(hydrateScript({ demo: 'button--variants', direction: 'ltr' })).toContain('hydrateDemo(Demo, "ltr", "en")')
  })
})

/** Runs the trap as the page would, against the few globals it touches. */
function page(root = '/repo') {
  const listeners = new Map<string, (event: Record<string, unknown>) => void>()
  const html = { dataset: {} as Record<string, string> }
  const box = { hidden: true, textContent: '' }
  const printed: unknown[][] = []
  class HTMLScriptElement { readonly tagName = 'SCRIPT' }
  class HTMLImageElement { readonly tagName = 'IMG' }
  const window: { __harness?: { root: string, errors: string[], fail: (kind: string, detail: unknown) => void, done: () => void } } = {}
  const context = {
    window,
    document: { documentElement: html, getElementById: (id: string) => (id === 'harness-errors' ? box : null) },
    console: { error: (...args: unknown[]) => { printed.push(args) } },
    addEventListener: (type: string, listener: (event: Record<string, unknown>) => void) => { listeners.set(type, listener) },
    HTMLScriptElement,
  }
  runInNewContext(trapScript(root), context)
  const trap = window.__harness
  if (!trap) throw new Error('the trap left nothing on window')
  const fire = (type: string, event: Record<string, unknown>) => { listeners.get(type)?.(event) }
  return { html, box, printed, trap, fire, window, context, script: new HTMLScriptElement(), image: new HTMLImageElement() }
}

describe('the trap a live page starts with', () => {
  it('marks the page pending, then hydrated once the tree says it is done', () => {
    const { html, trap, box } = page()
    expect(html.dataset['harness']).toBe('pending')
    trap.done()
    expect(html.dataset['harness']).toBe('hydrated')
    expect(trap.errors).toEqual([])
    expect(box.hidden).toBe(true)
  })

  it('says which checkout served the page', () => {
    expect(page('/home/omar/topclassui').trap.root).toBe('/home/omar/topclassui')
    expect(page(String.raw`C:\www\harness`).trap.root).toBe(String.raw`C:\www\harness`)
  })

  it('fails the page on a hydration repair, and stays failed when the tree finishes afterwards', () => {
    const { html, trap, box } = page()
    trap.fail('hydration', 'the server rendered text did not match')
    expect(html.dataset['harness']).toBe('failed')
    trap.done()
    expect(html.dataset['harness']).toBe('failed')
    expect(trap.errors).toEqual(['hydration: the server rendered text did not match'])
    // The same list, in the red box, for a person who opened the page by hand.
    expect(box).toEqual({ hidden: false, textContent: 'hydration: the server rendered text did not match' })
  })

  it('records a console.error, joins its arguments, and still prints it', () => {
    const { html, trap, printed, context } = page()
    context.console.error('Warning: %s', 'a prop did not match', { id: 3 })
    expect(trap.errors).toEqual(['console.error: Warning: %s a prop did not match {"id":3}'])
    expect(html.dataset['harness']).toBe('failed')
    expect(printed).toEqual([['Warning: %s', 'a prop did not match', { id: 3 }]])
  })

  it('turns a hydrated page into a failed one when the error comes later', () => {
    const { html, trap, context } = page()
    trap.done()
    context.console.error('late')
    expect(html.dataset['harness']).toBe('failed')
  })

  it('records an uncaught error and an unhandled rejection', () => {
    const { trap, fire, window } = page()
    fire('error', { target: window, message: 'Uncaught ReferenceError: x is not defined' })
    fire('unhandledrejection', { reason: 'the fetch was refused' })
    expect(trap.errors).toEqual([
      'uncaught: Uncaught ReferenceError: x is not defined',
      'unhandled rejection: the fetch was refused',
    ])
  })

  it('records a script that did not load, so a broken import fails at once instead of timing out', () => {
    const { html, trap, fire, script } = page()
    fire('error', { target: script })
    expect(trap.errors).toEqual(['load: a script or one of its imports did not load'])
    expect(html.dataset['harness']).toBe('failed')
  })

  it('leaves a picture that did not load to the demo: the avatar shows one on purpose', () => {
    const { html, trap, fire, image } = page()
    fire('error', { target: image })
    expect(trap.errors).toEqual([])
    expect(html.dataset['harness']).toBe('pending')
  })

  it('lists every failure in the box, a blank line apart, once the box exists', () => {
    const { trap, box, fire } = page()
    trap.fail('hydration', 'one')
    trap.fail('console.error', 'two')
    expect(box.textContent).toBe('hydration: one\n\nconsole.error: two')
    box.hidden = true
    fire('DOMContentLoaded', {})
    expect(box.hidden).toBe(false)
  })

  it('cannot be closed by a path: a < is written as an escape, which the script reads back as itself', () => {
    const script = trapScript('/tmp/</script><script>alert(1)//')
    expect(script).not.toContain('</script>')
    expect(page('/tmp/</script><script>alert(1)//').trap.root).toBe('/tmp/</script><script>alert(1)//')
  })
})

describe('the live page', () => {
  const route = { demo: 'tooltip--basic', mode: 'light', direction: 'rtl', edge: 'top', tall: true } as const
  const html = livePageHtml(route, '<button>B</button>', '.a{}', '/repo')

  it('is the static page, with the same root attributes and the same box around the demo', () => {
    expect(html).toContain('<html lang="ar" dir="rtl" data-theme="light">')
    expect(html).toContain('<title>tooltip--basic - light - rtl</title>')
    expect(html).toContain('<style>.a{}</style>')
    expect(html).toContain('<h1 class="sr-only">tooltip--basic</h1>')
    // No white space inside main: hydrateRoot takes #demo as its container and would find a stray text node.
    expect(html).toContain('<main id="demo" class="p-8"><button>B</button></main>')
  })

  it('carries the edge and the height on the body, where a test can change them without a reload', () => {
    expect(html).toContain('<body class="bg-page text-body" data-edge="top" data-tall>')
    const plain = livePageHtml({ ...route, edge: null, tall: false }, '', '', '/repo')
    expect(plain).toContain('<body class="bg-page text-body">')
    expect(livePageHtml({ ...route, edge: 'end', tall: false }, '', '', '/repo'))
      .toContain('<body class="bg-page text-body" data-edge="end">')
  })

  it('sets the trap in the head, before the module that hydrates, which comes after the demo', () => {
    const trap = html.indexOf('<script>(() => {\n  const html = document.documentElement')
    const demo = html.indexOf('<main id="demo"')
    const hydrate = html.indexOf([
      '<script type="module">',
      'import { hydrateDemo } from "/scripts/lib/live-client.tsx"',
      'import Demo from "/src/components/tooltip/dummy/basic.tsx"',
      'hydrateDemo(Demo, "rtl", "ar")',
      '</script>',
    ].join('\n'))
    expect(trap).toBeGreaterThan(0)
    expect(trap).toBeLessThan(html.indexOf('</head>'))
    expect(html.slice(trap, html.indexOf('</head>'))).toContain('root: "/repo",')
    expect(demo).toBeGreaterThan(trap)
    expect(hydrate).toBeGreaterThan(demo)
  })

  it('declares an empty icon, so a browser never asks for a favicon the server does not have', () => {
    expect(html).toContain('<link rel="icon" href="data:,">\n<style>body[data-edge]')
  })

  it('keeps the error box out of the page until something fails', () => {
    expect(ERROR_BOX).toBe('fixed inset-x-0 bottom-0 z-(--tc-z-toast) max-h-[50dvh] overflow-auto bg-danger-solid p-4 text-sm whitespace-pre-wrap text-danger-on-solid')
    expect(html).toContain('<pre id="harness-errors" class="fixed inset-x-0 bottom-0 z-(--tc-z-toast) max-h-[50dvh] overflow-auto bg-danger-solid p-4 text-sm whitespace-pre-wrap text-danger-on-solid" hidden></pre>')
  })

  it('pins with one flex box as large as the viewport, start and end by direction, and grows by two screens', () => {
    expect(html).toContain('body[data-tall]::after { content: ""; display: block; height: 200dvh; }</style>')
    expect(SHELL_CSS.split('\n')).toEqual([
      'body[data-edge] > #demo { display: flex; min-height: 100dvh; padding: 0; }',
      'body[data-edge="top"] > #demo { align-items: flex-start; justify-content: center; }',
      'body[data-edge="bottom"] > #demo { align-items: flex-end; justify-content: center; }',
      'body[data-edge="start"] > #demo { align-items: center; justify-content: flex-start; }',
      'body[data-edge="end"] > #demo { align-items: center; justify-content: flex-end; }',
      'body[data-tall]::after { content: ""; display: block; height: 200dvh; }',
    ])
  })

  it('names every class the shell writes for the stylesheet, since no file under src/ does', () => {
    expect(candidatesIn(livePageHtml(route, '', '', '/repo')).sort()).toEqual([
      'bg-danger-solid', 'bg-page', 'bottom-0', 'fixed', 'inset-x-0', 'max-h-[50dvh]', 'overflow-auto', 'p-4', 'p-8',
      'sr-only', 'text-body', 'text-danger-on-solid', 'text-sm', 'whitespace-pre-wrap', 'z-(--tc-z-toast)',
    ])
    expect([...SHELL_CANDIDATES].sort()).toEqual([
      'bg-danger-solid', 'bg-page', 'bottom-0', 'fixed', 'inset-x-0', 'max-h-[50dvh]', 'overflow-auto', 'p-4', 'p-8',
      'sr-only', 'text-body', 'text-danger-on-solid', 'text-sm', 'whitespace-pre-wrap', 'z-(--tc-z-toast)',
    ])
  })
})

describe('the toast placement of a page', () => {
  it('is a parameter a route carries and reads back', () => {
    expect(routeFor('toast--basic', 'light', 'rtl', { toast: 'top-start' })).toBe('/toast--basic--light--rtl.html?toast=top-start')
    expect(parseRoute('/toast--basic--light--rtl.html?toast=top-start'))
      .toEqual({ demo: 'toast--basic', mode: 'light', direction: 'rtl', edge: null, tall: false, toast: 'top-start' })
  })

  it('refuses a placement outside the six, and a physical side', () => {
    expect(parseRoute('/toast--basic--light--ltr.html?toast=bottom-right'))
      .toEqual({ error: 'the toast placement "bottom-right" is not one of top-start, top, top-end, bottom-start, bottom, bottom-end' })
  })

  it('reaches the hydration call only when the page names one, so every other page hydrates as before', () => {
    expect(hydrateScript({ demo: 'toast--basic', direction: 'ltr', toast: 'top' })).toContain('hydrateDemo(Demo, "ltr", "en", "top")')
    expect(hydrateScript({ demo: 'toast--basic', direction: 'ltr' })).toContain('hydrateDemo(Demo, "ltr", "en")')
  })
})
