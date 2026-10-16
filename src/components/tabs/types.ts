import type { Tabs as Base } from '@base-ui/react/tabs'

import type { Size } from '#shared/contracts/size.js'
import type { TABS_VARIANTS } from './constants.js'
import type { TabsSchemaInput } from './schema.js'

export type TabsVariant = (typeof TABS_VARIANTS)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type TabsDesignProps = {
  [K in keyof TabsSchemaInput]?: TabsSchemaInput[K] | undefined
}

/** What the root hands its list and its tabs through context: the look they all share, and
 * the value the page opens on, which the server HTML needs to keep one tab in the tab order. */
export interface TabsLook {
  variant: TabsVariant
  size: Size
  opensOn: unknown
}

/** What every part takes in place of Base UI's state function. */
interface OwnClassName {
  /** Merged last, so a consumer class wins a conflict with the part's own. */
  className?: string | undefined
}

/** R-5.6-1: a tablist draws no text of its own, so a caller must name it one of two ways. */
export type TabsListName =
  | {
    /** The name read out when no visible text names the tabs. */
    'aria-label': string
    'aria-labelledby'?: string | undefined
  }
  | {
    'aria-label'?: string | undefined
    /** The id of the visible text that names the tabs. */
    'aria-labelledby': string
  }

// R-5.7-5: derived at the seam, so every Base UI prop passes through untouched.
export type TabsRootProps = Omit<Base.Root.Props, 'className'>
  & Pick<TabsDesignProps, 'variant' | 'size'>
  & OwnClassName

export type TabsListProps = Omit<Base.List.Props, 'className' | 'aria-label' | 'aria-labelledby'>
  & TabsListName
  & OwnClassName

export type TabsTabProps = Omit<Base.Tab.Props, 'className'> & OwnClassName

/** Base UI's panel, with our default for keepMounted: true, where Base UI's is false. */
export type TabsPanelProps = Omit<Base.Panel.Props, 'className' | 'keepMounted'>
  & Pick<TabsDesignProps, 'keepMounted'>
  & OwnClassName
