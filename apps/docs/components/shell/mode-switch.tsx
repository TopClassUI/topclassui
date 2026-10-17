'use client'

import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'
import { Svg } from 'topclassui/svg'
import { moon } from 'topclassui/icons/moon'
import { palette } from 'topclassui/icons/palette'
import { sun } from 'topclassui/icons/sun'

import type { Mode } from '../../labels/index'
import { useModeSwitch } from './use-mode-switch'

export interface ModeSwitchProps {
  label: string
  names: Record<Mode, string>
}

const ICONS = { light: sun, dark: moon, ocean: palette } as const
const ORDER = ['light', 'dark', 'ocean'] as const

/** TODO(tc): ThemeSwitcher and useTheme once the library ships them (docs-site S4, S12). */
export function ModeSwitch({ label, names }: ModeSwitchProps) {
  const { mode, select } = useModeSwitch('dark')
  return (
    <SegmentedControlRoot aria-label={label} value={mode} onValueChange={select} size="sm">
      {ORDER.map((value) => (
        <SegmentedControlItem key={value} value={value} icon={<Svg icon={ICONS[value]} />}>
          <span className="max-md:sr-only">{names[value]}</span>
        </SegmentedControlItem>
      ))}
    </SegmentedControlRoot>
  )
}
