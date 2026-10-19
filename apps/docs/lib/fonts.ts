// The site's two fonts, shared by the site and /preview layouts so a preview renders in the same type as the page.
import { Inter, Noto_Sans_Arabic } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' })
// PLAN 14: only Inter is preloaded. On /en the Arabic sample of Home falls back to the system font, so its 160 KB never loads there.
export const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--font-noto-arabic', display: 'swap', preload: false })

/** The font variables an html element of this language carries. */
export const fontClassOf = (lang: string): string => (lang === 'ar' ? `${inter.variable} ${notoArabic.variable}` : inter.variable)
