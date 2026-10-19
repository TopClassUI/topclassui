import type { MetadataRoute } from 'next'

import { en } from '../labels/en'
import { FACTS } from '../lib/data'
import { MANIFEST_ICON_SIZES } from '../lib/icon-tile'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: en.meta.siteName,
    short_name: en.meta.siteName,
    description: en.meta.homeTitle,
    start_url: '/en',
    display: 'standalone',
    background_color: FACTS.page.dark,
    theme_color: FACTS.page.dark,
    icons: [
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      ...MANIFEST_ICON_SIZES.map((size) => ({ src: `/icon-${String(size)}.png`, sizes: `${String(size)}x${String(size)}`, type: 'image/png', purpose: 'any' as const })),
    ],
  }
}
