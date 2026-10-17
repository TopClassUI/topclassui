// Loaded into a live page by e2e/navbar.spec.ts: the bar inside the layouts and with the content no demo should
// show, landmarks beside it, and a sticky bar a button mounts and unmounts. Inline styles only: the stylesheet of
// a live page is compiled from src/, so a class written here alone would not exist.
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Breadcrumb } from '#components/breadcrumb/index.js'
import { Button } from '#components/button/index.js'
import { NavbarActions, NavbarBrand, NavbarLink, NavbarLinks, NavbarRoot } from '#components/navbar/index.js'
import { Pagination } from '#components/pagination/index.js'

const SIX = ['Docs', 'Components', 'Icons', 'Theming', 'Connectors', 'Changelog']
const SIXTY = Array.from({ length: 60 }, (_, index) => `Link ${String(index + 1)}`)
const WORD = 'W'.repeat(300)

const SECTION: CSSProperties = { marginBlock: 24 }
const SIDE: CSSProperties = { width: 96, flex: 'none' }

interface BarProps { id: string, name: string, links?: string[], sticky?: boolean }

/** The bar the brief asks for: a brand, six links and two actions. Never sticky unless asked: one bar a page sticks. */
function Bar({ id, name, links = SIX, sticky = false }: BarProps) {
  return (
    <NavbarRoot id={id} sticky={sticky}>
      <NavbarBrand href="/">TopClass UI</NavbarBrand>
      <NavbarLinks aria-label={name}>
        {links.map((label, index) => <NavbarLink key={label} href={`/${label}`} current={index === 1}>{label}</NavbarLink>)}
      </NavbarLinks>
      <NavbarActions>
        <Button variant="ghost" render={<a href="/search" />}>Search</Button>
        <Button render={<a href="/login" />}>Sign in</Button>
      </NavbarActions>
    </NavbarRoot>
  )
}

/** A sticky bar that a button mounts and unmounts, as a client navigation to a page without it would. */
function Mounted() {
  const [shown, setShown] = useState(false)
  const [rows, setRows] = useState(1)
  return (
    <section id="mounting" style={SECTION}>
      <button id="toggle-bar" type="button" style={{ minHeight: 44 }} onClick={() => { setShown((now) => !now) }}>Toggle the bar</button>
      <button id="add-row" type="button" style={{ minHeight: 44 }} onClick={() => { setRows((now) => now + 1) }}>Add a row</button>
      {shown ? (
        <NavbarRoot id="mounted">
          <NavbarBrand href="/">Mounted</NavbarBrand>
          {/* A full-width child takes a row of its own: the bar grows by a row each time. */}
          {Array.from({ length: rows - 1 }, (_, index) => <div key={index} data-row="" style={{ flexBasis: '100%', height: 40 }} />)}
        </NavbarRoot>
      ) : null}
    </section>
  )
}

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  // The spec waits for this: the effects of every part, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <div ref={root} id="navbar-fixture">
      <section id="plain" style={SECTION}><Bar id="plain-bar" name="plain" /></section>

      <section id="in-grid" style={{ ...SECTION, display: 'grid', gridTemplateColumns: '96px 1fr', gap: 8 }}>
        <div>Side</div>
        <Bar id="grid-bar" name="grid" />
      </section>
      <section id="in-flex" style={{ ...SECTION, display: 'flex', gap: 8 }}>
        <div style={SIDE}>Side</div>
        <div id="flex-column" style={{ flex: 1 }}><Bar id="flex-bar" name="flex" /></div>
      </section>
      <section id="in-row" style={{ ...SECTION, display: 'flex' }}><Bar id="row-bar" name="row" /></section>
      <section id="in-fit" style={SECTION}>
        <div id="fit-parent" style={{ width: 'fit-content', maxWidth: '100%' }}><Bar id="fit-bar" name="fit" /></div>
      </section>
      <section id="in-cell" style={SECTION}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <tbody><tr><td style={{ width: 96 }}>Side</td><td><Bar id="cell-bar" name="cell" /></td></tr></tbody>
        </table>
      </section>

      <section id="hostile" style={SECTION}>
        <NavbarRoot id="word-bar" sticky={false}>
          <NavbarBrand href="/">{WORD}</NavbarBrand>
          <NavbarLinks aria-label="word">
            <NavbarLink href="/word">{WORD}</NavbarLink>
            <NavbarLink href="/next">Next</NavbarLink>
          </NavbarLinks>
          <NavbarActions><Button render={<a href="/word" />}>{WORD}</Button></NavbarActions>
        </NavbarRoot>
        <NavbarRoot id="element-bar" sticky={false} style={SECTION}>
          <NavbarBrand href="/"><strong>Bold</strong> and <em>{WORD}</em></NavbarBrand>
          <NavbarLinks aria-label="element">
            <NavbarLink href="/element"><strong>Bold</strong> and <em>italic</em></NavbarLink>
            <NavbarLink href="/block"><div>A block</div></NavbarLink>
          </NavbarLinks>
          <NavbarActions><div style={{ width: 600, height: 20 }} /></NavbarActions>
        </NavbarRoot>
        <Bar id="sixty-bar" name="sixty" links={SIXTY} />
        <NavbarRoot id="empty-bar" sticky={false} style={SECTION}>
          <NavbarBrand href="/" aria-label="Home" />
          <NavbarLinks aria-label="empty">
            <NavbarLink href="/empty" aria-label="Empty" />
            <NavbarLink href="/space" aria-label="Space"> </NavbarLink>
            <NavbarLink href="/blank" aria-label="Blank">{''}</NavbarLink>
          </NavbarLinks>
          <NavbarActions />
        </NavbarRoot>
        <NavbarRoot id="bare-bar" sticky={false} />
        <NavbarRoot id="links-only" sticky={false}><NavbarLinks aria-label="links only" /></NavbarRoot>
      </section>

      <section id="landmarks" style={SECTION}>
        <NavbarRoot sticky={false}>
          <NavbarLinks><NavbarLink href="/docs">Docs</NavbarLink></NavbarLinks>
        </NavbarRoot>
        <NavbarRoot sticky={false}>
          <NavbarLinks aria-label="Docs sections"><NavbarLink href="/install">Install</NavbarLink></NavbarLinks>
        </NavbarRoot>
        <Breadcrumb items={[{ href: '/', label: 'Home' }, { label: 'Docs' }]} />
        <Pagination value={2} pageCount={5} getHref={(page) => `/docs?page=${String(page)}`} />
      </section>
      <section id="collision" style={SECTION}>
        <NavbarRoot sticky={false}>
          <NavbarLinks><NavbarLink href="/a">First</NavbarLink></NavbarLinks>
        </NavbarRoot>
        <NavbarRoot sticky={false}>
          <NavbarLinks><NavbarLink href="/b">Second</NavbarLink></NavbarLinks>
        </NavbarRoot>
      </section>

      <Mounted />
    </div>
  )
}

function mount(tree: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  createRoot(container).render(tree)
}

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
mount(<TopClassProvider direction={direction} locale={document.documentElement.lang}><Fixture /></TopClassProvider>)
