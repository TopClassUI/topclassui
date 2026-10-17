// Layer 2 of validation (DECISIONS 2026-10-07): the sent value read again after the native attribute is bypassed, and its mark.
import * as z from 'zod/mini'

import type { Labels } from '#shared/labels/types.js'

/** The validity flag of the native check each rule stands in for. */
export type ValueFault = 'tooLong' | 'patternMismatch' | 'rangeUnderflow' | 'rangeOverflow' | 'stepMismatch'

/** What a control promised its value would respect: its resolved cap and pattern, or its bounds and step. */
export interface ValueRules {
  maxLength?: number | null | undefined
  /** An HTML `pattern`: matched whole, with the `v` flag, and ignored when it does not compile, as a browser does. */
  pattern?: string | undefined
  /** Set for a number: the value is read as one and held to `min`, `max` and `step`. */
  numeric?: boolean | undefined
  min?: number | undefined
  max?: number | undefined
  step?: number | 'any' | undefined
  /** The step base when there is no `min`: HTML takes the value attribute, which React keeps equal to a controlled value. */
  stepBase?: number | undefined
}

/** HTML compiles a pattern as `^(?:pattern)$` with the `v` flag, and a pattern that throws checks nothing. */
export function patternOf(pattern: string | undefined): RegExp | null {
  if (pattern === undefined || pattern === '') return null
  try {
    return new RegExp(`^(?:${pattern})$`, 'v')
  } catch {
    return null
  }
}

const isLimit = (n: number | null | undefined): n is number => typeof n === 'number' && Number.isFinite(n)

/** Off the step when (value - base) / step is not whole. A billionth of a step is float noise. */
function onStep(value: number, step: number, base: number): boolean {
  const steps = (value - base) / step
  return Math.abs(steps - Math.round(steps)) <= 1e-9 * Math.max(1, Math.abs(steps))
}

/** The schema of a text value: its length, then its pattern. */
export function textSchema({ maxLength, pattern }: ValueRules) {
  const checks: z.core.$ZodCheck<string>[] = []
  // Not z.maxLength, which counts code points in zod 4.6.5: maxlength counts UTF-16 units, so an emoji is two.
  if (isLimit(maxLength)) checks.push(z.refine((value: string) => value.length <= maxLength, 'tooLong'))
  const regex = patternOf(pattern)
  if (regex) checks.push(z.regex(regex, 'patternMismatch'))
  return z.string().check(...checks)
}

/** The schema of a number value: its bounds, then its step. */
export function numberSchema({ min, max, step, stepBase }: ValueRules) {
  const checks: z.core.$ZodCheck<number>[] = []
  if (isLimit(min)) checks.push(z.gte(min, 'rangeUnderflow'))
  if (isLimit(max)) checks.push(z.lte(max, 'rangeOverflow'))
  const base = isLimit(min) ? min : stepBase
  if (typeof step === 'number' && step > 0 && isLimit(base)) {
    checks.push(z.refine((value: number) => onStep(value, step, base), 'stepMismatch'))
  }
  return z.number().check(...checks)
}

const FAULTS: readonly ValueFault[] = ['tooLong', 'patternMismatch', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch']

/** The first rule the value breaks, or null. An empty value breaks none: emptiness is `required`'s, which the browser checks. */
export function faultOf(value: string, rules: ValueRules): ValueFault | null {
  if (value === '') return null
  if (!rules.numeric) return firstFault(z.safeParse(textSchema(rules), value))
  const number = Number(value)
  // Text a number cannot be read from is the browser's badInput, which the hidden number input already reports.
  return Number.isNaN(number) ? null : firstFault(z.safeParse(numberSchema(rules), number))
}

/** Each check above names its fault as its message, so the first issue says which rule broke. */
function firstFault(result: { success: boolean, error?: { issues: readonly { message: string }[] } | undefined }): ValueFault | null {
  const message = result.error?.issues[0]?.message
  return FAULTS.find((fault) => fault === message) ?? null
}

/** An element the mark goes on; an input also takes the message. */
export type Marked = HTMLElement & { setCustomValidity?: (message: string) => void, reportValidity?: () => boolean }

/** The aria-invalid each mark had before the check set it, so clearing the fault gives the caller's back. */
const before = new WeakMap<Element, string | null>()

/** The words of a fault, numbers in the provider's digits. */
export function messageOf(fault: ValueFault, rules: ValueRules, labels: Labels['valueCheck'], fmt: Intl.NumberFormat): string {
  if (fault === 'tooLong') return labels.tooLong(rules.maxLength ?? 0, fmt)
  if (fault === 'rangeUnderflow') return labels.rangeUnderflow(rules.min ?? 0, fmt)
  if (fault === 'rangeOverflow') return labels.rangeOverflow(rules.max ?? 0, fmt)
  return labels[fault]
}

/** Sets or clears the mark: the message on the first input, aria-invalid and data-value-fault on each. */
export function markFault(marks: readonly Marked[], fault: ValueFault | null, message: string): void {
  marks[0]?.setCustomValidity?.(fault ? message : '')
  for (const node of marks) {
    if (fault) {
      if (!node.hasAttribute('data-value-fault')) before.set(node, node.getAttribute('aria-invalid'))
      node.setAttribute('data-value-fault', fault)
      node.setAttribute('aria-invalid', 'true')
    } else if (node.hasAttribute('data-value-fault')) {
      node.removeAttribute('data-value-fault')
      const own = before.get(node)
      if (own === null || own === undefined) node.removeAttribute('aria-invalid')
      else node.setAttribute('aria-invalid', own)
    }
  }
}
