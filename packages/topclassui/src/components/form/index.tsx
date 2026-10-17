// No 'use client': a plain form is server HTML and posts with no script. FormAction is the client half.
import { cn } from '#shared/cn.js'
import type { FormProps } from './types.js'

/** A native form, with the browser's own `required` check before hydration and after: no `noValidate`, no class of
 * its own. `action` is a URL or a Server Action. */
export function Form({ className, ...rest }: FormProps) {
  return <form {...rest} className={cn(className) || undefined} />
}

export { FormAction } from './client.js'
export type { FormActionFunction, FormActionProps, FormActionState, FormProps } from './types.js'
