'use client'

import { Menu as Base } from '@base-ui/react/menu'

import { cn } from '#shared/cn.js'
import { renderPart } from '#shared/render-trigger.js'
import { DROPDOWN_GROUP_LABEL } from '../classes.js'
import type { DropdownGroupLabelProps } from '../types.js'

/** The name of a group. It is no row: the arrow keys pass it. */
export function DropdownGroupLabel({ className, render, ...rest }: DropdownGroupLabelProps) {
  const part = renderPart(render, cn(DROPDOWN_GROUP_LABEL, className))
  return <Base.GroupLabel {...rest} render={part.render} className={part.className} />
}
