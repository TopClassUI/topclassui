// Loaded into a live page by e2e/shared-toggle.spec.ts: the smallest stand-in for a toggle, built from the shared toggle
// classes alone, since no toggle exists yet. A target that takes the press, and the drawn box inside it.
// Inline styles for the page around them, since the harness compiles only the classes it finds under src/.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { TOGGLE_BOX, TOGGLE_INVALID, TOGGLE_ON, TOGGLE_SIZE, TOGGLE_TARGET } from '#shared/classes.js'

type Size = Exclude<keyof typeof TOGGLE_SIZE, 'custom'>

const SIZES: readonly Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const BOX = `${TOGGLE_BOX} ${TOGGLE_ON} ${TOGGLE_INVALID}`

const PAGE: CSSProperties = { display: 'grid', gap: 24, padding: 24, alignContent: 'start' }
const ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }

interface ToggleProps { id: string; size?: Size; checked?: boolean; invalid?: boolean; width?: number }

/** The markup a Checkbox renders: a native button with the role, and Base UI's state attributes on it. */
function Toggle({ id, size = 'md', checked = false, invalid = false, width }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-label={id}
      aria-checked={checked}
      aria-invalid={invalid || undefined}
      data-checked={checked ? '' : undefined}
      data-unchecked={checked ? undefined : ''}
      data-size={size}
      className={TOGGLE_TARGET}
    >
      {/* A switch track is wider than tall: the width a Switch's own class gives it at md. */}
      <span data-box="" className={`${BOX} ${TOGGLE_SIZE[size]}`} style={width === undefined ? undefined : { width }} />
    </button>
  )
}

function Fixture() {
  return (
    <div id="toggles" style={PAGE}>
      <div id="sizes" style={ROW}>
        {SIZES.map((size) => <Toggle key={size} id={`size-${size}`} size={size} />)}
      </div>
      <div id="grid" style={{ display: 'grid' }}>
        <Toggle id="in-grid" width={35} />
      </div>
      <div id="states" style={ROW}>
        <Toggle id="checked" checked />
        <Toggle id="invalid" invalid />
        <Toggle id="checked-invalid" checked invalid />
      </div>
      {/* An accordion trigger is a bare group, and a focusable one. */}
      <div id="trigger" role="group" aria-label="An accordion trigger" tabIndex={0} className="group" style={{ padding: 8 }}>
        <Toggle id="in-trigger" />
      </div>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
