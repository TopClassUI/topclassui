'use client'

import { useContext } from 'react'

import { type Direction, TopClassContext } from './context.js'

/** The `dir` and `lang` a portaled part writes on the element it positions. A portal sits in the
 * body and inherits neither from an island, so they are the provider's; with no provider both are
 * undefined and the page's own apply. Every portaled part of Unit 3 calls it from its hook.ts. */
export function usePortalLocale(): { dir: Direction | undefined, lang: string | undefined } {
  const provided = useContext(TopClassContext)
  return { dir: provided?.direction, lang: provided?.locale }
}
