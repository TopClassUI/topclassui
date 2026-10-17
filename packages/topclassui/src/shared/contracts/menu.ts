// R-8.3-1: types and one value list, so nothing that reads the menu contract pulls zod into the bundle.
import type { ReactElement, ReactNode } from 'react'

import type { Tone } from './tone.js'

/** The two looks a menu row has: `danger` is for a destructive item such as Delete. */
export const MENU_ITEM_TONES = ['neutral', 'danger'] as const satisfies readonly Tone[]
export type MenuItemTone = (typeof MENU_ITEM_TONES)[number]

/** What every item carries, whichever of the three kinds it is. */
interface MenuItemBase {
  /** Stable identity, which the menu keys its rows by. */
  id: string
  label: string
  /** An element, not a name: `<Icon name>` is async, so the page renders it and passes the result. */
  icon?: ReactNode | undefined
  /** Shown at the end of the row, such as `Ctrl P`. */
  shortcut?: string | undefined
  tone?: MenuItemTone | undefined
  disabled?: boolean | undefined
  /** Draws a line above this item. */
  separatorBefore?: boolean | undefined
}

/** A link: a real anchor, so open-in-new-tab and middle-click work. It crosses from a server page. */
interface MenuLinkItem extends MenuItemBase {
  href: string
  action?: undefined
  onSelect?: undefined
}

/** A Server Action, the one function a server page may pass. */
interface MenuActionItem extends MenuItemBase {
  action: (formData: FormData) => void | Promise<void>
  href?: undefined
  onSelect?: undefined
}

/** Client only: a plain function passed from a Server Component throws at render. */
interface MenuSelectItem extends MenuItemBase {
  onSelect: () => void
  href?: undefined
  action?: undefined
}

/** One row of a menu, and exactly one of three kinds: an item with two of them, or with none, does not compile. */
export type MenuItem = MenuLinkItem | MenuActionItem | MenuSelectItem

/** What a data-driven menu takes, so a Dropdown and a Drawer menu are driven by the same props. */
export interface MenuContract {
  /** The element that opens the menu, such as a Button. */
  trigger: ReactElement
  /** The name of the menu, which labels its group of items. */
  title: string
  items: readonly MenuItem[]
  /** The element every `href` item is cloned from, such as `link={<Link href="" />}`; its href is replaced with the item's. */
  link?: ReactElement | undefined
  open?: boolean | undefined
  defaultOpen?: boolean | undefined
  /** Client only, like `onSelect`. */
  onOpenChange?: ((open: boolean) => void) | undefined
}
