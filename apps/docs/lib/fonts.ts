// The mono face of both root layouts, so code reads the same in a guide and in a demo preview; globals.css maps --tc-font-mono to it.
import { Geist_Mono } from 'next/font/google'

/** Not preloaded: PLAN 14 preloads the primary face alone, and a page with no code never fetches this one. */
export const geistMono = Geist_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-geist-mono', display: 'swap', preload: false })
