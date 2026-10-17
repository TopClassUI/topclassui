// Loaded into a live page by e2e/sidebar.spec.ts: a rail in the layouts and with the content no demo should show.
// Mounted in a provider of the page's own direction, as the harness mounts a demo. Inline styles only: the
// stylesheet of a live page is compiled from src/, so a class written here alone would not exist.
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { fileText } from '#icons/data/file-text.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '#components/sidebar/index.js'
import { Svg } from '#components/svg/index.js'
import { Table, type TableColumn } from '#components/table/index.js'

const WORD = 'W'.repeat(300)
const SECTION: CSSProperties = { marginBlock: 24 }
const TALL: CSSProperties = { height: 320 }
const NAMES = ['Home', 'Projects', 'Team', 'Settings']
const SENTENCE = 'Start of the label: settings for the whole workspace and every team in it, end'
const MIXED = 'Wi-Fi متصل بالشبكة اللاسلكية في المكتب الرئيسي وفي كل الفروع الأخرى'
const EMOJI = `${'a'.repeat(99)}\u{1F600}tail`

const page = <Svg icon={fileText} />

function Rail({ id, names = NAMES, defaultOpen }: { id: string, names?: string[], defaultOpen?: boolean }) {
  return (
    <SidebarRoot id={id} defaultOpen={defaultOpen}>
      <SidebarHeader>Workspace</SidebarHeader>
      <SidebarBody>
        <SidebarGroup>
          {names.map((name, index) => <SidebarLink key={name} href={`#${id}-${String(index)}`} icon={page} current={index === 0}>{name}</SidebarLink>)}
        </SidebarGroup>
      </SidebarBody>
    </SidebarRoot>
  )
}

interface Order { id: string, customer: string, placed: string, status: string, warehouse: string, total: string }
const ORDERS: Order[] = [
  { id: 'ORD-5521', customer: 'Northwind Traders', placed: '12 March 2026', status: 'Awaiting payment', warehouse: 'Amman, building 4', total: '$1,250.00' },
  { id: 'ORD-5520', customer: 'Contoso Ltd', placed: '11 March 2026', status: 'Shipped', warehouse: 'Irbid, building 1', total: '$480.00' },
]
const COLUMNS: TableColumn<Order>[] = [
  { key: 'id', header: 'Order', rowHeader: true, cell: (order) => order.id },
  { key: 'customer', header: 'Customer', cell: (order) => order.customer },
  { key: 'placed', header: 'Placed', cell: (order) => order.placed },
  { key: 'status', header: 'Status', cell: (order) => order.status },
  { key: 'warehouse', header: 'Warehouse', cell: (order) => order.warehouse },
  { key: 'total', header: 'Total', align: 'end', cell: (order) => order.total },
]

/** Some 760 px of table: the widest thing the column beside a rail has to hold. */
function Wide({ name }: { name: string }) {
  return <Table caption={`Orders in ${name}`} items={ORDERS} getKey={(order) => order.id} columns={COLUMNS} />
}

/** Ten groups of six rows, each group with a label: sixty rows and ten labels a collapsed rail has to hide. */
function tenGroups(prefix: string) {
  return Array.from({ length: 10 }, (_, group) => (
    <SidebarGroup key={group} label={`Group ${String(group + 1)}`}>
      {Array.from({ length: 6 }, (_, row) => (
        <SidebarLink key={row} href={`#${prefix}${String(group)}-${String(row)}`} icon={page}>{`Row ${String(group * 6 + row + 1)}`}</SidebarLink>
      ))}
    </SidebarGroup>
  ))
}

/** A rail whose caller holds the state. `fixed` never moves it; the log is every value onOpenChange was given. */
function Held({ id, fixed }: { id: string, fixed: boolean }) {
  const [open, setOpen] = useState(true)
  const [log, setLog] = useState<boolean[]>([])
  return (
    <div style={TALL}>
      <SidebarRoot id={id} open={open} onOpenChange={(next) => { setLog((seen) => [...seen, next]); if (!fixed) setOpen(next) }}>
        <SidebarHeader>Held</SidebarHeader>
        <SidebarBody><SidebarGroup><SidebarLink href={`#${id}-0`} icon={page}>Home</SidebarLink></SidebarGroup></SidebarBody>
      </SidebarRoot>
      <output id={`${id}-log`}>{log.join(',')}</output>
    </div>
  )
}

/** A rail that holds its own state and reports each change, as a page that only wants to know would use it. */
function Heard({ id }: { id: string }) {
  const [log, setLog] = useState<boolean[]>([])
  return (
    <div style={TALL}>
      <SidebarRoot id={id} onOpenChange={(next) => { setLog((seen) => [...seen, next]) }}>
        <SidebarHeader>Heard</SidebarHeader>
        <SidebarBody><SidebarGroup><SidebarLink href={`#${id}-0`} icon={page}>Home</SidebarLink></SidebarGroup></SidebarBody>
      </SidebarRoot>
      <output id={`${id}-log`}>{log.join(',')}</output>
    </div>
  )
}

function Fixture() {
  const root = useRef<HTMLDivElement>(null)
  // The spec waits for this: the effects of every rail, which are children, have run by now.
  useEffect(() => { root.current?.setAttribute('data-ready', '') }, [])
  return (
    <div ref={root} id="sidebar-fixture">
      <section id="states" style={{ ...SECTION, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <Held id="fixed" fixed />
        <Held id="followed" fixed={false} />
        <Heard id="heard" />
      </section>

      <section id="in-flex" style={{ ...SECTION, ...TALL, display: 'flex' }}>
        <Rail id="flex-rail" />
        <div id="flex-column" style={{ flex: 1 }}><Wide name="a flex row" /></div>
      </section>
      <section id="in-grid" style={{ ...SECTION, ...TALL, display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
        <Rail id="grid-rail" />
        <div id="grid-column"><Wide name="a grid" /></div>
      </section>
      <section id="in-fit" style={{ ...SECTION, ...TALL, width: 'fit-content' }}>
        <Rail id="fit-rail" />
      </section>
      <section id="in-cell" style={SECTION}>
        <table>
          <tbody><tr><td style={{ ...TALL, padding: 0 }}><Rail id="cell-rail" /></td><td>Beside</td></tr></tbody>
        </table>
      </section>

      <section id="hostile" style={{ ...SECTION, ...TALL }}>
        <SidebarRoot id="hostile-rail">
          <SidebarHeader>{WORD}</SidebarHeader>
          <SidebarBody>
            <SidebarGroup label={WORD}>
              <SidebarLink id="word" href="#word" icon={page}>{WORD}</SidebarLink>
              <SidebarLink id="element" href="#element" icon={page}><strong>Bold</strong> and <em>{WORD}</em></SidebarLink>
              <SidebarLink id="empty" href="#empty" icon={page} aria-label="Empty" />
              <SidebarLink id="bare-row" href="#bare-row">No icon</SidebarLink>
              <SidebarLink id="wide-icon" href="#wide-icon" icon={<span style={{ display: 'block', width: 400, height: 14 }} />}>Wide icon</SidebarLink>
              <SidebarLink id="own-children" render={<a href="#own-children">Own children</a>} icon={page} />
              <SidebarLink id="big-icon" href="#big-icon" icon={<Svg icon={fileText} size="md" />}>Big icon</SidebarLink>
            </SidebarGroup>
            <SidebarGroup label="">
              <SidebarLink id="unnamed-group" href="#unnamed-group" icon={page}>In a group with an empty label</SidebarLink>
            </SidebarGroup>
            <SidebarGroup label="An empty group" />
          </SidebarBody>
        </SidebarRoot>
      </section>

      <section id="many-groups" style={{ ...SECTION, ...TALL }}>
        <SidebarRoot id="groups-rail" defaultOpen={false}>
          <SidebarHeader>Ten groups</SidebarHeader>
          <SidebarBody>{tenGroups('g')}</SidebarBody>
        </SidebarRoot>
      </section>

      {/* No SidebarBody: the groups sit straight in the rail, and a box of the page is what scrolls them. */}
      <section id="outer-scroll" style={{ ...SECTION, height: 200, overflow: 'auto' }}>
        <SidebarRoot id="loose-rail" defaultOpen={false} aria-label="Loose">{tenGroups('l')}</SidebarRoot>
      </section>

      <section id="no-header" style={{ ...SECTION, ...TALL }}>
        <SidebarRoot id="plain-rail" aria-label="Documentation">
          <SidebarBody>
            <SidebarGroup label="Getting started">
              <SidebarLink href="#install">Install</SidebarLink>
              <SidebarLink href="#theming" current>Theming</SidebarLink>
            </SidebarGroup>
          </SidebarBody>
        </SidebarRoot>
      </section>

      {/* Labels in the other script, in two scripts, and one whose bound falls inside an emoji. */}
      <section id="cut" style={{ ...SECTION, ...TALL }}>
        <SidebarRoot id="cut-rail">
          <SidebarHeader>{SENTENCE}</SidebarHeader>
          <SidebarBody>
            <SidebarGroup label={SENTENCE}>
              <SidebarLink id="cut-sentence" href="#cut-sentence" icon={page}>{SENTENCE}</SidebarLink>
              <SidebarLink id="cut-mixed" href="#cut-mixed" icon={page}>{MIXED}</SidebarLink>
              <SidebarLink id="cut-emoji" href="#cut-emoji" icon={page}>{EMOJI}</SidebarLink>
            </SidebarGroup>
            <SidebarGroup id="cut-short" label="Settings">
              <SidebarLink href="#cut-short" icon={page}>Home</SidebarLink>
            </SidebarGroup>
          </SidebarBody>
        </SidebarRoot>
      </section>
    </div>
  )
}

/** A rail with NO TopClassProvider, which R-13-1 forbids: its two names fall back to English, whatever the page is. */
function Bare() {
  return <div id="bare" style={{ ...SECTION, ...TALL }}><Rail id="bare-rail" /></div>
}

function mount(tree: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  createRoot(container).render(tree)
}

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
mount(<Bare />)
mount(<TopClassProvider direction={direction} locale={document.documentElement.lang}><Fixture /></TopClassProvider>)
