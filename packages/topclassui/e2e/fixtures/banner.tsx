// Loaded into a live page by e2e/banner-dismiss.spec.ts: dismissible banners with the content and in the layouts no
// demo shows, and one whose onDismiss a test can count. Mounted in a provider of the page's own direction, as the
// harness mounts a demo. Inline styles only: the stylesheet of a live page is compiled from src/.
import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { Banner, BannerDismissible } from '#components/banner/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const WORD = 'W'.repeat(300)
const MESSAGE = 'Your workspace has used its monthly build minutes, so new deployments wait until the plan is upgraded.'

const SECTION: CSSProperties = { marginBlock: 16 }
const CELL: CSSProperties = { border: '1px solid GrayText', padding: 8 }

/** Counts the calls on the element the spec reads, so a second call shows. */
function counted() {
  const out = document.getElementById('dismiss-count')
  if (out) out.dataset['count'] = String(Number(out.dataset['count'] ?? '0') + 1)
}

function One({ id, name, children, action }: { id: string, name: string, children?: ReactNode, action?: ReactNode }) {
  return <Banner dismissible id={id} tone="warning" aria-label={name} action={action}>{children}</Banner>
}

const ACTION = <Button size="sm" variant="outline" tone="warning">Upgrade</Button>

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="banner-fixture" ref={root}>
        <section id="counted" style={SECTION}>
          <BannerDismissible id="fixture-counted" aria-label="Counted" onDismiss={counted}>Version 2 is out.</BannerDismissible>
          <output id="dismiss-count" data-count="0" />
        </section>
        <section id="hostile" style={SECTION}>
          <One id="fixture-word" name="Long word" action={ACTION}>{WORD}</One>
          <One id="fixture-element" name="Element">
            <ul><li>Build 41 failed on step four.</li><li>Build 42 is waiting for a runner.</li></ul>
          </One>
          <One id="fixture-empty" name="Empty" />
        </section>
        <section id="layouts" style={SECTION}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <span>One</span>
            <One id="fixture-grid" name="In a grid track" action={ACTION}>{MESSAGE}</One>
            <span>Three</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBlock: 16 }}>
            <span style={{ width: 80, flex: 'none' }}>Side</span>
            <div style={{ flex: 1, minWidth: 0 }}><One id="fixture-flex" name="In a flex-1 column" action={ACTION}>{MESSAGE}</One></div>
          </div>
          <div style={{ width: 'fit-content', marginBlock: 16 }}>
            <One id="fixture-fit" name="In a w-fit parent" action={ACTION}>{MESSAGE}</One>
          </div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                <td style={CELL}>Website redesign</td>
                <td style={CELL}><One id="fixture-cell" name="In a table cell" action={ACTION}>{MESSAGE}</One></td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
