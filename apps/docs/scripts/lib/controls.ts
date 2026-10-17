// The Try it panel's controls, from the schema's JSON: never a hand-written list per component.
import type { JsonSchemaObject, JsonSchemaProp } from '../../../../packages/topclassui/scripts/lib/readme.js'

export type ControlValue = string | number | boolean

export type Control =
  | { prop: string; kind: 'select' | 'segmented'; options: ControlValue[]; default: ControlValue | null }
  | { prop: string; kind: 'switch'; default: boolean }
  | { prop: string; kind: 'slider'; min: number; max: number; step: number | null; default: number | null }
  | { prop: string; kind: 'number'; min: number | null; max: number | null; step: number | null; default: number | null }

/** A segmented control up to this many values; a select above it. */
export const SEGMENTED_MAX = 3
/** A wider range is a guard rail (R-5.7-8), such as pageCount up to 2^53, which no slider can step through. */
export const SLIDER_SPAN = 10_000

const numberOrNull = (value: unknown) => (typeof value === 'number' ? value : null)

/** One control for a prop, or null when the schema gives nothing a control can offer (a free string, a union). */
export function controlOf(prop: string, schema: JsonSchemaProp): Control | null {
  if (schema.enum) {
    // R-5.7-2: `custom` emits no size classes, so the stage would show nothing to compare.
    const options = schema.enum.filter((value) => !(prop === 'size' && value === 'custom'))
    const value = schema.default
    const fallback = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : null
    return { prop, kind: options.length <= SEGMENTED_MAX ? 'segmented' : 'select', options, default: fallback }
  }
  if (schema.type === 'boolean') return { prop, kind: 'switch', default: schema.default === true }
  if (schema.type === 'number' || schema.type === 'integer') {
    const step = schema.type === 'integer' ? 1 : null
    const value = numberOrNull(schema.default)
    const { minimum: min, maximum: max } = schema
    if (min !== undefined && max !== undefined && max - min <= SLIDER_SPAN) {
      return { prop, kind: 'slider', min, max, step, default: value }
    }
    return { prop, kind: 'number', min: min ?? null, max: max ?? null, step, default: value }
  }
  return null
}

/** Every control, in the schema's order. */
export function controlsOf(json: JsonSchemaObject): Control[] {
  return Object.entries(json.properties ?? {})
    .map(([prop, schema]) => controlOf(prop, schema))
    .filter((control) => control !== null)
}
