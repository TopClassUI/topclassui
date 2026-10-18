import type { MetadataRoute } from 'next'

import { en } from '../labels/en'
import { FACTS } from '../lib/data'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: en.meta.siteName,
    short_name: en.meta.siteName,
    description: en.meta.homeTitle,
    start_url: '/en',
    display: 'standalone',
    background_color: FACTS.page.dark,
    theme_color: FACTS.page.dark,
    icons: [{ src: '/icon', sizes: '64x64', type: 'image/png' }],
  }
}
