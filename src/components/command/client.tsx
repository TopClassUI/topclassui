'use client'

import { lazy, Suspense } from 'react'

import { useCommand } from './hook.js'
import type { CommandPanelProps, CommandProps } from './types.js'

// Its own chunk: the dialog, the autocomplete and the rows load on the first open, never with the page.
const CommandPanel = lazy(() => import('./parts/command-panel.js').then((module) => ({ default: module.CommandPanel })))

/** A searchable list of actions in a dialog. Before its first open it renders nothing and has
 * loaded none of Base UI: Ctrl or Cmd with the shortcut, or open, asks for the panel. */
export function Command<T>({ open, defaultOpen, onOpenChange, shortcut, ...rest }: CommandProps<T>) {
  const shell = useCommand({ open, defaultOpen, onOpenChange, shortcut })
  if (!shell.mounted) return null
  return (
    <Suspense fallback={null}>
      {/* The panel reads each item only through the caller's own functions, so it needs no T. */}
      <CommandPanel {...(rest as Omit<CommandPanelProps, 'open' | 'onOpenChange'>)} open={shell.open} onOpenChange={shell.setOpen} />
    </Suspense>
  )
}
