// Loaded into a live page by e2e/textarea.spec.ts: a plain textarea and an autosize one of a single row, one above the other at
// each size. The server writes the autosize one as the plain one, so the two must stay the same box once hydrated.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Textarea } from '#components/textarea/index.js'
import type { Size } from '#shared/contracts/size.js'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      {/* The rows stretch: a field's 100% is then the page, not the intrinsic width of a textarea, which follows the fonts. */}
      <div id="rows" style={{ display: 'grid', gap: 8, padding: 16 }}>
        {SIZES.map((size) => (
          <div key={size} data-size={size} style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
            <Textarea aria-label={`${size} plain`} size={size} rows={1} />
            <Textarea aria-label={`${size} autosize`} size={size} rows={1} autosize />
          </div>
        ))}
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
