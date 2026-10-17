'use client'

import { Menu as Base } from '@base-ui/react/menu'

import { cn } from '#shared/cn.js'
import { DROPDOWN_GROUP_LABEL } from '../classes.js'
import type { DropdownGroupLabelProps } from '../types.js'

/** The name of a group. It is no row: the arrow keys pass it. */
export function DropdownGroupLabel({ className, ...rest }: DropdownGroupLabelProps) {
  return <Base.GroupLabel {...rest} className={cn(DROPDOWN_GROUP_LABEL, className)} />
}
