import { ImageResponse } from 'next/og'

import { BrandMark } from '../components/shell/brand-mark'
import { FACTS } from '../lib/data'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** The home-screen icon: the same tile, square, since the platform rounds it. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: FACTS.dark.primary }}>
        <BrandMark color={FACTS.dark.body} size={150} />
      </div>
    ),
    size,
  )
}
