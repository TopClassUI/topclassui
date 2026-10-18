import { ImageResponse } from 'next/og'

import { FACTS } from '../lib/data'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

/** The tab icon and the manifest's: a T on the primary colour, built once at build time. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: FACTS.dark.primary, color: FACTS.dark.body, fontSize: 44, fontWeight: 700 }}>T</div>
    ),
    size,
  )
}
