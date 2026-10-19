// The Try it panel's controls, from the schema's JSON: never a hand-written list per component.
import type { JsonSchemaObject, JsonSchemaProp } from '../../../../packages/topclassui/scripts/lib/readme.js'

export type ControlValue = string | number | boolean

export type Control =
  | { prop: string; kind: 'select' | 'segmented'; options: ControlValue[]; default: ControlValue | null }
  | { prop: string; kind: 'switch'; default: boolean }
  | { prop: string; kind: 'slider'; min: number; max: number; step: number | null; default: number | null }
  | { prop: string; kind: 'number'; min: number | null; max: number | null; step: number | null; default: number | null }

/** An integer range up to this many steps is a fixed option set, a select as the Previewer frames draw visibleRows; a wider one is a slider. */
export const SELECT_SPAN = 100
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
    return { prop, kind: 'select', options, default: fallback }
  }
  if (schema.type === 'boolean') return { prop, kind: 'switch', default: schema.default === true }
  if (schema.type === 'number' || schema.type === 'integer') {
    const step = schema.type === 'integer' ? 1 : null
    const value = numberOrNull(schema.default)
    const { minimum: min, maximum: max } = schema
    if (schema.type === 'integer' && min !== undefined && max !== undefined && max - min <= SELECT_SPAN) {
      return { prop, kind: 'select', options: Array.from({ length: max - min + 1 }, (_, index) => min + index), default: value }
    }
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

/** The starting values a playground demo gives its own props in its signature, `{ dismissible = true, size = 'lg' }`:
 * the stage opens as the demo draws it, so Try it starts there too, and the schema default only where the demo sets nothing. */
export function demoStartsOf(source: string): Record<string, ControlValue> {
  const params = /export default function \w+\(\s*\{([^}]*)\}/.exec(source)?.[1] ?? ''
  const starts: Record<string, ControlValue> = {}
  for (const [, name = '', raw = ''] of params.matchAll(/(\w+)\s*=\s*(true|false|-?\d+(?:\.\d+)?|'[^']*'|"[^"]*")/g)) {
    starts[name] = raw === 'true' ? true : raw === 'false' ? false : /^-?\d/.test(raw) ? Number(raw) : raw.slice(1, -1)
  }
  return starts
}

/** The controls with each start the demo sets written in as the default. */
export function withStarts(controls: readonly Control[], starts: Readonly<Record<string, ControlValue>>): Control[] {
  return controls.map((control) => {
    const start = starts[control.prop]
    if (start === undefined) return control
    if (control.kind === 'switch') return typeof start === 'boolean' ? { ...control, default: start } : control
    if (control.kind === 'slider' || control.kind === 'number') return typeof start === 'number' ? { ...control, default: start } : control
    return control.options.includes(start) ? { ...control, default: start } : control
  })
}
