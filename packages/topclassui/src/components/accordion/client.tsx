'use client'

import { Accordion as Base } from '@base-ui/react/accordion'

import { caretDown } from '#icons/data/caret-down.js'
import { cn } from '#shared/cn.js'
import { renderPart } from '#shared/render-trigger.js'
import { Svg } from '#components/svg/index.js'
import {
  ACCORDION_CARET, ACCORDION_CONTENT, ACCORDION_ITEM, ACCORDION_PANEL, ACCORDION_ROOT, ACCORDION_TITLE,
  ACCORDION_TRIGGER,
} from './classes.js'
import { ACCORDION_DEFAULTS } from './constants.js'
import { useAccordionItem } from './hook.js'
import { headingFor } from './lib.js'
import type { AccordionItemProps, AccordionRootProps } from './types.js'

/** Base UI's root, in the box. It holds which items are open; a closed panel stays in the
 * HTML, hidden until the browser finds text in it, unless hiddenUntilFound is false. */
export function AccordionRoot({
  hiddenUntilFound = ACCORDION_DEFAULTS.hiddenUntilFound,
  className,
  render,
  ...rest
}: AccordionRootProps) {
  const part = renderPart(render, cn(ACCORDION_ROOT, className))
  return <Base.Root {...rest} hiddenUntilFound={hiddenUntilFound} render={part.render} className={part.className} />
}

/** One item: a heading that holds the trigger, then the panel. Rest props reach the item's
 * own element. The title and the children are rendered by whoever passes them: a server page. */
export function AccordionItem({
  title,
  headingLevel = ACCORDION_DEFAULTS.headingLevel,
  className,
  render,
  children,
  ...rest
}: AccordionItemProps) {
  const Heading = headingFor(headingLevel)
  const item = useAccordionItem()
  const part = renderPart(render, cn(ACCORDION_ITEM, className))
  return (
    <Base.Item {...rest} render={part.render} className={part.className}>
      <Base.Header render={<Heading />}>
        <Base.Trigger id={item.triggerId} onClick={item.onClick} className={ACCORDION_TRIGGER}>
          <span className={ACCORDION_TITLE}>{title}</span>
          <span className={ACCORDION_CARET}><Svg icon={caretDown} flipRtl={false} /></span>
        </Base.Trigger>
      </Base.Header>
      <Base.Panel role={undefined} aria-labelledby={undefined} className={ACCORDION_PANEL}>
        <div
          ref={item.ref}
          role="region"
          aria-labelledby={item.triggerId}
          tabIndex={item.tabIndex}
          className={ACCORDION_CONTENT}
        >
          {children}
        </div>
      </Base.Panel>
    </Base.Item>
  )
}
