// The PNG tiles the manifest lists past 124's 64 px icon: review-notes/logo/final/icon-tile.svg at any size.
import { ImageResponse } from 'next/og'

import { BrandMark } from '../components/shell/brand-mark'
import { FACTS } from './data'

export const MANIFEST_ICON_SIZES = [192, 512] as const

/** The mark on the primary tile, the tile's radius scaled from its 14 of 64. */
export function iconTile(size: number): Response {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: Math.round((size * 14) / 64), background: FACTS.dark.primary }}>
        <BrandMark color={FACTS.dark.body} size={size} />
      </div>
    ),
    { width: size, height: size },
  )
}
