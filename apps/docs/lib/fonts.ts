// The site's fonts, shared by the site and /preview layouts so a preview renders in the same type as the page; globals.css maps --tc-font-mono to the mono face.
import { Geist_Mono, Inter, Noto_Sans_Arabic } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' })
// Not preloaded by next/font, so /en never loads these 160 KB; /ar preloads its faces itself (lib/arabic-preload.ts). Optional, not swap: a late swap moves every Arabic line.
export const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--font-noto-arabic', display: 'optional', preload: false })
/** Preloaded: every page shows mono in the header's Ctrl K, and a late swap would shift it. */
export const geistMono = Geist_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-geist-mono', display: 'swap', preload: true })

/** The font variables an html element of this language carries. */
export const fontClassOf = (lang: string): string => (lang === 'ar' ? `${inter.variable} ${geistMono.variable} ${notoArabic.variable}` : `${inter.variable} ${geistMono.variable}`)
