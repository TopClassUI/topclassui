'use client'

import { useEffect, useState } from 'react'
import { BUILT_IN_MODES, THEME_STORAGE_KEY, type BuiltInMode } from 'topclassui/theme'

function isMode(value: string | undefined): value is BuiltInMode {
  return (BUILT_IN_MODES as readonly string[]).includes(value ?? '')
}

/** Reads the mode the theme script set before paint, then writes the attribute, storage and theme-color on change. */
export function useModeSwitch(serverMode: BuiltInMode) {
  const [mode, setMode] = useState<BuiltInMode>(serverMode)

  useEffect(() => {
    const current = document.documentElement.dataset.theme
    if (isMode(current)) setMode(current)
  }, [])

  const select = (value: string) => {
    if (!isMode(value)) return
    setMode(value)
    document.documentElement.dataset.theme = value
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value)
    } catch {
      // Storage can be blocked; the choice then lasts until the page is left.
    }
    const color = getComputedStyle(document.body).backgroundColor
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.setAttribute('content', color)
  }

  return { mode, select }
}
