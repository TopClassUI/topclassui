// The mono face of both root layouts, so code reads the same in a guide and in a demo preview; globals.css maps --tc-font-mono to it.
import { Geist_Mono } from 'next/font/google'

/** Preloaded: every page shows mono in the header's Ctrl K, and a late swap would shift it. */
export const geistMono = Geist_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-geist-mono', display: 'swap', preload: true })
