'use client'

// The card's own mode (S8): a scoped data-theme on the stage, Try it and the states, never on the page. The switch is card-mode-switch.tsx.
import { type ReactNode, createContext, use, useState } from 'react'

export const MODES = ['light', 'dark', 'ocean'] as const
export type Mode = (typeof MODES)[number]

export const isMode = (value: unknown): value is Mode => (MODES as readonly unknown[]).includes(value)

interface ModeState {
  mode: Mode | null
  setMode: (mode: Mode) => void
}

export const ModeContext = createContext<ModeState>({ mode: null, setMode: () => undefined })

/** Holds the card's mode; null follows the page. */
export function PreviewerModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode | null>(null)
  return <ModeContext value={{ mode, setMode }}>{children}</ModeContext>
}

export function ModeScope({ className, children }: { className?: string; children: ReactNode }) {
  const { mode } = use(ModeContext)
  return <div data-theme={mode ?? undefined} className={className}>{children}</div>
}
