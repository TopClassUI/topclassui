'use client'

// The card's own mode switch (S8): a scoped data-theme on the stage, Try it and the states, never on the page.
import { type ReactNode, createContext, use, useEffect, useState } from 'react'
import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'
import { Svg } from 'topclassui/svg'
import { moon } from 'topclassui/icons/moon'
import { palette } from 'topclassui/icons/palette'
import { sun } from 'topclassui/icons/sun'

export const MODES = ['light', 'dark', 'ocean'] as const
export type Mode = (typeof MODES)[number]

const isMode = (value: unknown): value is Mode => (MODES as readonly unknown[]).includes(value)

interface ModeState {
  mode: Mode | null
  setMode: (mode: Mode) => void
}

const ModeContext = createContext<ModeState>({ mode: null, setMode: () => undefined })

/** Holds the card's mode; null follows the page. */
export function PreviewerModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode | null>(null)
  return <ModeContext value={{ mode, setMode }}>{children}</ModeContext>
}

export function ModeScope({ className, children }: { className?: string; children: ReactNode }) {
  const { mode } = use(ModeContext)
  return <div data-theme={mode ?? undefined} className={className}>{children}</div>
}

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
