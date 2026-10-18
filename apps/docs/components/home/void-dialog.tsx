'use client'

import type { ReactNode } from 'react'
import { Button } from 'topclassui/button'
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle } from 'topclassui/dialog'

export interface VoidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  body: string
  keep: string
}

/** The invoice card's one client island, loaded on its first press. */
export default function VoidDialog({ open, onOpenChange, title, body, keep }: VoidDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" tone="neutral">{keep}</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
