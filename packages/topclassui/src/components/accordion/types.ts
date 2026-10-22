import type { Accordion as Base } from '@base-ui/react/accordion'
import type { ReactNode } from 'react'

import type { ACCORDION_HEADINGS } from './constants.js'
import type { AccordionSchemaInput } from './schema.js'

/** The five levels a heading inside a page can take. */
export type AccordionHeadingLevel = keyof typeof ACCORDION_HEADINGS

/** The tag an item's heading is rendered as. */
export type AccordionHeading = (typeof ACCORDION_HEADINGS)[AccordionHeadingLevel]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type AccordionDesignProps = {
  [K in keyof AccordionSchemaInput]?: AccordionSchemaInput[K] | undefined
}

/** What each part takes in place of Base UI's state function. */
interface OwnClassName {
  /** Merged last, so a consumer class wins a conflict with the part's own. */
  className?: string | undefined
}

// R-5.7-5: derived at the seam. loopFocus and orientation are deprecated in 1.8.0 and move no focus, so they are left out.
export type AccordionRootProps = Omit<Base.Root.Props<string>, 'className' | 'loopFocus' | 'orientation'>
  & Pick<AccordionDesignProps, 'size'>
  & OwnClassName

/** Base UI's item, with the three things it holds. Rest props reach the item's own element. */
export type AccordionItemProps = Omit<Base.Item.Props, 'className' | 'value' | 'title' | 'children'>
  & Pick<AccordionDesignProps, 'headingLevel'>
  & OwnClassName
  & {
    /** The name of this item in the root's value and defaultValue. */
    value: string
    /** The text of the trigger. It sits inside a button: text and inline elements, never a link or a control. */
    title: ReactNode
    /** What the panel holds. It stays in the HTML while the panel is closed. */
    children?: ReactNode | undefined
  }
