import { ImageResponse } from 'next/og'

import { BrandMark } from '../components/shell/brand-mark'
import { FACTS } from '../lib/data'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

/** The tab icon and the manifest's: the mark on the primary tile (review-notes/logo/final/icon-tile.svg), built once at build time. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14, background: FACTS.dark.primary }}>
        <BrandMark color={FACTS.dark.body} size={64} />
      </div>
    ),
    size,
  )
}
