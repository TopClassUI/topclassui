// The props table through the README generator, so the site and the README never disagree.
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import type ts from 'typescript'
import { z } from 'zod'

import type { ComponentMeta } from '../../../../packages/topclassui/src/shared/meta.js'
import {
  type JsonSchemaObject, type PropRow, mergeRows, rowsFromJsonSchema,
} from '../../../../packages/topclassui/scripts/lib/readme.js'
import { familyOf, ownPropsOf, valueExportsOf } from '../../../../packages/topclassui/scripts/lib/readme-types.js'

export interface PropsRow extends PropRow {
  min: number | null
  max: number | null
}

export interface PropsPart {
  name: string
  rows: PropsRow[]
}

/** The schema's JSON Schema form, picked as the README picks it: the first zod schema the file exports. */
export async function jsonSchemaOf(dir: string): Promise<JsonSchemaObject | null> {
  const file = join(dir, 'schema.ts')
  if (!existsSync(file)) return null
  const loaded = (await import(pathToFileURL(file).href)) as Record<string, unknown>
  const schema = Object.values(loaded).find((v) => v instanceof z.ZodType)
  return schema ? (z.toJSONSchema(schema, { io: 'input' }) as JsonSchemaObject) : null
}

/** Adds each row's min and max from the schema, the Limits column of the page's table. */
export function withLimits(rows: PropRow[], json: JsonSchemaObject | null): PropsRow[] {
  return rows.map((row) => {
    const schema = json?.properties?.[row.name]
    return { ...row, min: schema?.minimum ?? null, max: schema?.maximum ?? null }
  })
}

/** One part for a single component, or the family part by part, the Root first (R-9.2-4). */
export function propsOf(program: ts.Program, dir: string, meta: ComponentMeta, json: JsonSchemaObject | null): PropsPart[] {
  const fromSchema = json ? rowsFromJsonSchema(json) : []
  const typeFile = join(dir, 'types.ts')
  const hasTypes = existsSync(typeFile)
  const own = (name: string) => (hasTypes ? ownPropsOf(program, typeFile, name) : [])
  const single = own(`${meta.name}Props`)
  const fromTypes = single.length > 0 ? single : own(`${meta.name}RootProps`)
  const root = `${meta.name}Root`
  const exported = valueExportsOf(program, join(dir, 'index.tsx'))
  if (hasTypes && exported.includes(root)) {
    return familyOf(program, typeFile, exported, root, fromSchema).parts
      .map((part) => ({ name: part.name, rows: withLimits(part.rows, json) }))
  }
  // The part is named by its real export (OTPField), which the folder's PascalCase (OtpField) can miss.
  const name = exported.find((one) => /^[A-Z]/.test(one) && one.toLowerCase() === meta.name.toLowerCase()) ?? meta.name
  return [{ name, rows: withLimits(mergeRows(fromSchema, fromTypes), json) }]
}
