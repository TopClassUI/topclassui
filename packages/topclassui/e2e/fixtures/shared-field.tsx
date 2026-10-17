// Loaded into a live page by e2e/shared-field.spec.ts: the smallest stand-in for a field with no width of its own (a
// Select trigger, the box of a NumberField), built from the shared field classes alone, beside real Inputs to compare.
// Inline styles for the page around them, since the harness compiles only the classes it finds under src/.
import type { CSSProperties, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { Input } from '#components/input/index.js'
import {
  FIELD_HOLDER, FIELD_HOLDER_FULL, FIELD_INVALID_WITHIN, FIELD_SIZE, FIELD_SURFACE, FIELD_TEXT, LABEL, TARGET_HEIGHT,
} from '#shared/classes.js'
import { cn } from '#shared/cn.js'

type Size = Exclude<keyof typeof FIELD_TEXT, 'custom'>

const SIZES: readonly Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const LONG = 'x'.repeat(300)

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 16, alignContent: 'start' }
const PAIR: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }
const ROW: CSSProperties = { display: 'flex', gap: 8 }
const FIT: CSSProperties = { width: 'fit-content' }

interface HolderProps { id: string; size?: Size; label?: ReactNode; full?: boolean; invalid?: boolean }

/** A box the browser gives no width, holding one line of caller text that truncates: what a Select trigger is. */
function Holder({ id, size = 'md', label = 'Jordan', full = false, invalid = false }: HolderProps) {
  return (
    <div id={id} data-holder="" style={{ display: 'grid' }} className={cn(FIELD_HOLDER, FIELD_TEXT[size], full && FIELD_HOLDER_FULL)}>
      <div data-box="" style={{ display: 'flex', alignItems: 'center' }} className={cn(FIELD_SURFACE, TARGET_HEIGHT, FIELD_SIZE[size], FIELD_INVALID_WITHIN)}>
        {invalid
          ? <input aria-label={id} aria-invalid="true" style={{ minWidth: 0, width: '100%', border: 0, background: 'none' }} />
          : <span className={LABEL}>{label}</span>}
      </div>
    </div>
  )
}

function Fixture() {
  return (
    <div id="fields" style={PAGE}>
      <div id="block"><Holder id="alone" /></div>
      <div id="sizes" style={{ display: 'grid', gap: 8 }}>
        {SIZES.map((size) => <Holder key={size} id={`size-${size}`} size={size} />)}
      </div>
      <div style={FIT}><Holder id="fit-short" /></div>
      <div style={FIT}><Holder id="fit-long" label={LONG} /></div>
      <div style={PAIR}><Holder id="pair-a" /><Holder id="pair-b" label={LONG} /></div>
      <div style={PAIR}><Input id="input-a" aria-label="First" /><Input id="input-b" aria-label="Second" /></div>
      <div style={ROW}><Holder id="row-a" /><Holder id="row-b" label={LONG} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'center' }}>
        <span>Country of residence</span><Holder id="beside-label" label={LONG} />
      </div>
      <div id="full-parent"><Holder id="full" full /></div>
      <Holder id="invalid" invalid />
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
