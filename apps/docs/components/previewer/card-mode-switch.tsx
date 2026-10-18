'use client'

// The card's mode switch (S8), its own chunk: the provider and the scopes it drives stay in previewer-mode.tsx.
import { use, useEffect, useState } from 'react'
import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'
import { Svg } from 'topclassui/svg'
import { moon } from 'topclassui/icons/moon'
import { palette } from 'topclassui/icons/palette'
import { sun } from 'topclassui/icons/sun'

import { MODES, type Mode, ModeContext, isMode } from './previewer-mode'

export interface CardModeSwitchProps {
  label: string
  names: Record<Mode, string>
}

const ICONS = { light: sun, dark: moon, ocean: palette } as const

export function CardModeSwitch({ label, names }: CardModeSwitchProps) {
  const { mode, setMode } = use(ModeContext)
  const [page, setPage] = useState<Mode>('dark')
  useEffect(() => {
    const read = () => {
      const theme = document.documentElement.dataset.theme
      if (isMode(theme)) setPage(theme)
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => { observer.disconnect() }
  }, [])
  return (
    <SegmentedControlRoot
      aria-label={label}
      size="sm"
      value={mode ?? page}
      onValueChange={(value) => { if (isMode(value)) setMode(value) }}
    >
      {MODES.map((item) => (
        <SegmentedControlItem key={item} value={item} icon={<Svg icon={ICONS[item]} size="1rem" />}>
          {names[item]}
        </SegmentedControlItem>
      ))}
    </SegmentedControlRoot>
  )
}
