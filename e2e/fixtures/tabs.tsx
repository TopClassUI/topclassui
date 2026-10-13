// Loaded into a live page by e2e/tabs.spec.ts: Tabs inside the layouts and with the content no demo should show.
// Mounted in a provider of the page's own direction, as the harness mounts a demo. Inline styles only: the
// stylesheet of a live page is compiled from src/, so a class written here alone would not exist.
import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '#components/tabs/index.js'

const EIGHT = ['Overview', 'Activity', 'Members', 'Billing', 'Integrations', 'Security', 'Notifications', 'Changelog']
const SIXTY = Array.from({ length: 60 }, (_, index) => `Tab ${String(index + 1)}`)
const WORD = 'W'.repeat(300)
const LOOKS = ['line', 'enclosed'] as const

type Look = (typeof LOOKS)[number]

function Many({ id, variant, labels = EIGHT }: { id: string, variant: Look, labels?: string[] }) {
  return (
    <TabsRoot id={id} variant={variant} defaultValue={labels[0]}>
      <TabsList aria-label={id}>
        {labels.map((label) => <TabsTab key={label} value={label}>{label}</TabsTab>)}
      </TabsList>
      {labels.map((label) => <TabsPanel key={label} value={label}>Panel of {label}</TabsPanel>)}
    </TabsRoot>
  )
}

const SIDE: CSSProperties = { width: 96, flex: 'none' }
const SECTION: CSSProperties = { marginBlock: 24 }

/** One layout, holding eight tabs of each look: neither may make its parent wider than the page. */
function Layout({ id, children }: { id: string, children: (look: Look) => ReactNode }) {
  return <section id={id} style={SECTION}>{LOOKS.map((look) => <div key={look} style={SECTION}>{children(look)}</div>)}</section>
}

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  // The spec waits for this: the effects of every tab, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <div ref={root} id="tabs-fixture">
      <Layout id="in-grid">
        {(look) => (
          <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 8 }}>
            <div>Side</div>
            <Many id={`grid-${look}`} variant={look} />
          </div>
        )}
      </Layout>
      <Layout id="in-flex">
        {(look) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={SIDE}>Side</div>
            <div style={{ flex: 1 }}><Many id={`flex-${look}`} variant={look} /></div>
          </div>
        )}
      </Layout>
      <Layout id="in-fit">
        {(look) => <div style={{ width: 'fit-content' }}><Many id={`fit-${look}`} variant={look} /></div>}
      </Layout>
      <Layout id="in-cell">
        {(look) => (
          <table>
            <tbody><tr><td>Side</td><td><Many id={`cell-${look}`} variant={look} /></td></tr></tbody>
          </table>
        )}
      </Layout>
      <Layout id="sixty">{(look) => <Many id={`sixty-${look}`} variant={look} labels={SIXTY} />}</Layout>
      <Layout id="word">
        {(look) => (
          <TabsRoot id={`word-${look}`} variant={look} defaultValue="word">
            <TabsList aria-label={`word ${look}`}>
              <TabsTab value="word">{WORD}</TabsTab>
              <TabsTab value="next">Next</TabsTab>
            </TabsList>
            <TabsPanel value="word">{WORD}</TabsPanel>
            <TabsPanel value="next">Next</TabsPanel>
          </TabsRoot>
        )}
      </Layout>
      <Layout id="element">
        {(look) => (
          <TabsRoot id={`element-${look}`} variant={look} defaultValue="element">
            <TabsList aria-label={`element ${look}`}>
              <TabsTab value="element"><strong>Bold</strong> and <em>{WORD}</em></TabsTab>
              <TabsTab value="empty" aria-label="Empty" />
              <TabsTab value="space" aria-label="Space"> </TabsTab>
            </TabsList>
            <TabsPanel value="element">Panel of the element</TabsPanel>
            <TabsPanel value="empty" />
            <TabsPanel value="space" />
          </TabsRoot>
        )}
      </Layout>
      <section id="keys" style={SECTION}>
        <TabsRoot id="auto" defaultValue="one">
          <TabsList aria-label="auto" activateOnFocus>
            <TabsTab value="one">One</TabsTab>
            <TabsTab value="two" disabled>Two</TabsTab>
            <TabsTab value="three">Three</TabsTab>
          </TabsList>
          <TabsPanel value="one">Panel one</TabsPanel>
          <TabsPanel value="two">Panel two</TabsPanel>
          <TabsPanel value="three">Panel three</TabsPanel>
        </TabsRoot>
        <TabsRoot id="no-loop" defaultValue="one">
          <TabsList aria-label="no loop" loopFocus={false}>
            <TabsTab value="one">One</TabsTab>
            <TabsTab value="two">Two</TabsTab>
          </TabsList>
          <TabsPanel value="one">Panel one</TabsPanel>
          <TabsPanel value="two">Panel two</TabsPanel>
        </TabsRoot>
        <TabsRoot id="no-default">
          <TabsList aria-label="no default">
            <TabsTab value="a">First</TabsTab>
            <TabsTab value="b">Second</TabsTab>
          </TabsList>
          <TabsPanel value="a">Panel of the first</TabsPanel>
          <TabsPanel value="b">Panel of the second</TabsPanel>
        </TabsRoot>
        <TabsRoot id="controls" defaultValue="with">
          <TabsList aria-label="controls">
            <TabsTab value="with">Stop</TabsTab>
            <TabsTab value="without">No stop</TabsTab>
          </TabsList>
          <TabsPanel value="with"><button type="button">Inside the stop</button></TabsPanel>
          <TabsPanel value="without" tabIndex={-1}><button type="button">Inside no stop</button></TabsPanel>
        </TabsRoot>
        <TabsRoot id="unmounted" defaultValue="shown">
          <TabsList aria-label="unmounted">
            <TabsTab value="shown">Shown</TabsTab>
            <TabsTab value="heavy">Heavy</TabsTab>
          </TabsList>
          <TabsPanel value="shown">Shown panel</TabsPanel>
          <TabsPanel value="heavy" keepMounted={false}>Heavy panel</TabsPanel>
        </TabsRoot>
        <TabsRoot id="outer" variant="enclosed" size="lg" defaultValue="outer">
          <TabsList aria-label="outer">
            <TabsTab value="outer">Outer</TabsTab>
            <TabsTab value="other">Other</TabsTab>
          </TabsList>
          <TabsPanel value="outer">
            <TabsRoot id="inner" size="xs" defaultValue="inner">
              <TabsList aria-label="inner">
                <TabsTab value="inner">Inner</TabsTab>
                <TabsTab value="second">Second</TabsTab>
              </TabsList>
              <TabsPanel value="inner">Inner panel</TabsPanel>
              <TabsPanel value="second">Second inner panel</TabsPanel>
            </TabsRoot>
          </TabsPanel>
          <TabsPanel value="other">Other panel</TabsPanel>
        </TabsRoot>
      </section>
    </div>
  )
}

/** Tabs with NO TopClassProvider, which R-13-1 forbids: Base UI then takes left to right, whatever the page is. */
function Bare() {
  return (
    <TabsRoot id="bare" defaultValue="one">
      <TabsList aria-label="bare">
        <TabsTab value="one">One</TabsTab>
        <TabsTab value="two">Two</TabsTab>
        <TabsTab value="three">Three</TabsTab>
      </TabsList>
      <TabsPanel value="one">Panel one</TabsPanel>
      <TabsPanel value="two">Panel two</TabsPanel>
      <TabsPanel value="three">Panel three</TabsPanel>
    </TabsRoot>
  )
}

function mount(tree: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  createRoot(container).render(tree)
}

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
mount(<Bare />)
mount(<TopClassProvider direction={direction} locale={document.documentElement.lang}><Fixture /></TopClassProvider>)
