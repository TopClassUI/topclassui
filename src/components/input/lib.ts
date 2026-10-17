// Pure helpers of the input. No React, so a node test reads them as they are.
import type { ValueRules } from '#shared/value-check/lib.js'
import type { InputProps } from './types.js'

type CheckedProps = Pick<InputProps, 'pattern' | 'min' | 'max' | 'step' | 'value' | 'defaultValue'>

/** A number the caller wrote as a prop, or none: HTML reads min, max and step as text. */
function numberOf(given: number | string | undefined): number | undefined {
  if (given === undefined || given === '') return undefined
  const n = Number(given)
  return Number.isFinite(n) ? n : undefined
}

/** The rules the check holds a value to: the cap and pattern of a text type, the bounds and step of a number. */
export function checkRules(kind: string, cap: number | undefined, props: CheckedProps): ValueRules {
  if (kind !== 'number') return { maxLength: cap, pattern: props.pattern }
  const { min, max, step, value, defaultValue } = props
  return {
    numeric: true,
    min: numberOf(min),
    max: numberOf(max),
    // HTML's default step for a number is 1.
    step: step === 'any' ? 'any' : numberOf(step) ?? 1,
    // A controlled value is its own base, so no value is off its step; else the default, else 0.
    stepBase: value === undefined ? numberOf(asText(defaultValue)) ?? 0 : undefined,
  }
}

/** A default an input reads as text; an array never names a number. */
function asText(given: CheckedProps['defaultValue']): string | number | undefined {
  return typeof given === 'string' || typeof given === 'number' ? given : undefined
}
