// The predicates check-boundaries runs, split out so they can be tested against
// both line endings. Omar develops on Windows and CI runs Linux.
import { posix } from 'node:path'

/** A directive only counts as one before any statement; later it is a dead string. */
export function hasUseClient(source: string): boolean {
  const head = source.replace(/^\uFEFF/, '').trimStart()
  return /^(['"])use client\1\s*;?/.test(head)
}

/** A 'use client' that is not first, which compiles as a Server Component and throws at render. */
export function hasLateUseClient(source: string): boolean {
  if (hasUseClient(source)) return false
  return /^[ \t]*(['"])use client\1[ \t]*;?[ \t]*\r?$/m.test(source)
}

/** Named imports from one module, with `type` qualifiers stripped. */
export function importedNames(source: string, from: string): string[] {
  const names: string[] = []
  // The default clause may sit before the braces: import React, { useState } from 'react'.
  const re = new RegExp(`import\\s+(?:[\\w$]+\\s*,\\s*)?\\{([^}]*)\\}\\s*from\\s*['"]${from}['"]`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(source))) {
    for (const part of (m[1] ?? '').split(',')) {
      const name = (part.split(' as ')[0] ?? '').trim()
      if (name && name !== 'type') names.push(name.replace(/^type\s+/, ''))
    }
  }
  return names
}

/** Every form that pulls a module in: bare, named, re-exported, dynamic and require. */
const SPECIFIER = /(?:\bimport\s*\(\s*|\brequire\s*\(\s*|\bfrom\s+|\bimport\s+)['"]([^'"]+)['"]/g

/** Each module id the file imports, however it imports it. */
export function importedModules(source: string): string[] {
  return [...source.matchAll(SPECIFIER)].map((m) => m[1] ?? '')
}

/** Prop interfaces declared in a component file instead of types.ts (R-8.3-4). */
export function inlinePropInterfaces(source: string): string[] {
  return [...source.matchAll(/^export\s+(?:interface|type)\s+(\w*Props)\b/gm)].map((m) => m[1] ?? '')
}

/** Relative specifiers that are missing the .js the emitted ESM needs (R-5.12-5). */
export function relativeImportsMissingExtension(source: string): string[] {
  return importedModules(source)
    .filter((spec) => spec.startsWith('.') && !/\.(js|json|css|svg)$/.test(spec))
}

/** The local name of a namespace or default import, which hides hooks behind a member access. */
export function namespaceNamesOf(source: string, from: string): string[] {
  const quoted = `['"]${from}['"]`
  const out: string[] = []
  // String.raw, because a template literal silently turns \s into s.
  for (const pattern of [
    String.raw`import\s*\*\s*as\s+([\w$]+)\s*from\s*` + quoted,
    String.raw`import\s+([\w$]+)\s*(?:,[^;]*?)?\s*from\s*` + quoted,
  ]) {
    const re = new RegExp(pattern, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(source))) {
      const name = (m[1] ?? '').trim()
      if (name && name !== 'type') out.push(name)
    }
  }
  return [...new Set(out)]
}

/** Hooks reached through a namespace, such as React.useState, which a named scan misses. */
export function memberHookCalls(source: string, holders: string[]): string[] {
  const out: string[] = []
  for (const holder of holders) {
    const re = new RegExp(String.raw`\b` + holder + String.raw`\s*\.\s*(use[A-Z][\w$]*)`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(source))) out.push(m[1] ?? '')
  }
  return [...new Set(out)]
}

/** Every exported async form, not only `export async function` (R-5.1-5). */
export function exportsAsync(source: string): boolean {
  return /export\s+(?:default\s+)?async\s+function/.test(source)
    || /export\s+(?:const|let|var)\s+[\w$]+\s*(?::[^=]+)?=\s*async\b/.test(source)
    || /export\s+default\s+async\s*\(/.test(source)
}

/**
 * SCREAMING_CASE tables declared outside constants.ts and classes.ts (R-5.12-4). Only a
 * literal counts: `new Set(...)` or `cva(...)` is computed, not data someone goes looking
 * for, and the rule exists so a reader knows which file holds the lookups.
 */
export function screamingConstants(source: string): string[] {
  const name = String.raw`([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+|[A-Z][A-Z0-9]{2,})`
  const literal = String.raw`[{['"\`\d]`
  const re = new RegExp(String.raw`^(?:export\s+)?const\s+${name}\s*(?::[^=]+)?=\s*${literal}`, 'gm')
  return [...source.matchAll(re)].map((m) => m[1] ?? '')
}

/** The ids that hand out Base UI's render hooks: useRender's subpath, the hook it wraps, and the barrel. */
const USE_RENDER_HOMES = ['@base-ui/react/use-render', '@base-ui/react/internals/useRenderElement']
const BASE_UI_BARREL = '@base-ui/react'

/** A useRender that survives compilation (R-5.7-4); `import type` and `{ type useRender }` erase. */
export function runtimeUseRender(source: string): boolean {
  const quoted = (id: string) => String.raw`['"]` + id.replace(/[/@.-]/g, '\\$&') + String.raw`['"]`
  const homes = `(?:${USE_RENDER_HOMES.map(quoted).join('|')})`
  const barrel = quoted(BASE_UI_BARREL)
  const named = new RegExp(String.raw`(?:import|export)\s+(?!type\s)(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*(?:${homes}|${barrel})`, 'g')
  for (const m of source.matchAll(named)) {
    const names = (m[1] ?? '').split(',').map((part) => part.trim())
    if (names.some((name) => /^useRender(?:Element)?\b/.test(name))) return true
  }
  // A default, namespace, side-effect, dynamic or require form of a home runs it too, and `export *` publishes it.
  const whole = new RegExp(String.raw`(?:\bimport\s+(?!type\s)(?:[\w$*][^'"{}]*?\s+from\s*)?|\bimport\s*\(\s*|\brequire\s*\(\s*)${homes}`)
  if (whole.test(source)) return true
  if (new RegExp(String.raw`\bexport\s*\*\s*(?:as\s+[\w$]+\s*)?from\s*(?:${homes}|${barrel})`).test(source)) return true
  return memberHookCalls(source, namespaceNamesOf(source, BASE_UI_BARREL)).some((hook) => /^useRender(?:Element)?$/.test(hook))
}

/** The source with comments blanked, so a commented-out call is not counted. */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ')
}

/** The source with comments and string contents blanked, so a brace inside either is not counted. */
function codeOnly(source: string): string {
  return withoutComments(source).replace(/'(?:\\.|[^'\\\r\n])*'|"(?:\\.|[^"\\\r\n])*"/g, "''")
}

/** The body of each object pattern: a typed parameter `({ ... }: T)`, or `const { ... } = name`. */
function destructuredProps(code: string, from: string[]): string[] {
  const out: string[] = []
  for (const m of code.matchAll(/\(\s*\{|\bconst\s*\{/g)) {
    const body = m.index + m[0].length
    let depth = 0
    for (let i = body - 1; i < code.length; i++) {
      if (code[i] === '{') depth++
      else if (code[i] === '}' && --depth === 0) {
        const after = code.slice(i + 1)
        const typed = m[0].startsWith('(') && /^\s*:/.test(after)
        const fromParam = !m[0].startsWith('(') && from.some((name) => new RegExp(String.raw`^\s*=\s*${name}\b(?!\s*[.[(])`).test(after))
        if (typed || fromParam) out.push(code.slice(body, i))
        break
      }
    }
  }
  return out
}

/** The name of each function's first parameter when it is a plain identifier: `function A(p` or `(p: T) =>`. */
function firstParams(code: string): string[] {
  const names = [
    ...code.matchAll(/\bfunction\b\s*[\w$]*\s*(?:<[^>]*>)?\s*\(\s*([\w$]+)\s*[:,)]/g),
    ...code.matchAll(/\(\s*([\w$]+)\s*(?::[^()]*(?:\([^()]*\)[^()]*)*)?\)\s*(?::[^=]*)?=>/g),
  ].map((m) => (m[1] ?? '').replace(/\$/g, '\\$'))
  return [...new Set(names)]
}

/** A component that takes `render` (or the `link` element of R-5.7-4) from its props, by destructuring or by member access. */
export function acceptsRenderProp(source: string, prop: 'render' | 'link' = 'render'): boolean {
  const code = codeOnly(source)
  const params = firstParams(code)
  // Only the top level of the pattern: a nested `{ render }` is some other object's key.
  const topLevel = (body: string) => body.replace(/\{[^{}]*\}/g, '').replace(/\{[^{}]*\}/g, '')
  const key = new RegExp(String.raw`(?:^|,)\s*${prop}\s*(?:[,=:]|$)`)
  return destructuredProps(code, params).some((body) => key.test(topLevel(body)))
    || params.some((name) => new RegExp(String.raw`\b${name}\s*\.\s*${prop}\b`).test(code))
}

/** The local names a runtime named import of `name` binds, when its specifier resolves to `target` under src/. */
function importedBindings(source: string, file: string, name: string, target: string): string[] {
  const out: string[] = []
  for (const m of source.matchAll(/import\s+(?!type\s)\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    const spec = m[2] ?? ''
    const resolved = spec.startsWith('#shared/')
      ? `src/shared/${spec.slice('#shared/'.length)}`
      : spec.startsWith('.') ? posix.normalize(posix.join(posix.dirname(file), spec)) : ''
    if (resolved.replace(/\.js$/, '') !== target) continue
    for (const part of (m[1] ?? '').split(',')) {
      const [imported, local] = part.trim().split(/\s+as\s+/)
      if (imported === name) out.push(local ?? imported)
    }
  }
  return out
}

/** renderElement imported at runtime from src/shared/render.ts, by alias or by a relative path that reaches it. */
export function importsRenderElement(source: string, file: string): boolean {
  return importedBindings(source, file, 'renderElement', 'src/shared/render').length > 0
}

/** Whether `prop` is implemented with renderElement (R-5.7-4): a call to it, or to renderLink, which
 * calls it; `render` may also be handed on unchanged as `render={render}` to a component that does. */
export function implementsRenderProp(source: string, file: string, prop: 'render' | 'link' = 'render'): boolean {
  const code = codeOnly(source)
  const locals = [
    ...importedBindings(source, file, 'renderElement', 'src/shared/render'),
    ...importedBindings(source, file, 'renderLink', 'src/shared/link'),
  ]
  if (locals.some((local) => new RegExp(String.raw`(?<![\w$.])${local.replace(/\$/g, '\\$')}\s*\(`).test(code))) return true
  return prop === 'render' && /\brender\s*=\s*\{\s*render\s*\}/.test(code)
}

/** A function form of render handled by hand (R-5.7-4): `typeof render === 'function'` or a call to render.
 * A backstop only; the element form is pinned by each server component's types.ts and its type tests. */
export function handlesRenderFunction(source: string): boolean {
  const code = withoutComments(source)
  return /\btypeof\s+(?:[\w$]+\s*\.\s*)?render\s*[!=]==?\s*['"]function['"]/.test(code)
    || /(?<![\w$])render\s*\(/.test(codeOnly(source))
}

/** R-5.12-1: hook.ts sits behind the client boundary, so only client.tsx or a 'use client' part imports it. */
export function strayHookImport(pathInFolder: string, source: string): boolean {
  const own = importedModules(source).some((spec) => /^\.\.?\/hook\.js$/.test(spec))
  if (!own) return false
  if (pathInFolder === 'client.tsx') return false
  return !(pathInFolder.startsWith('parts/') && hasUseClient(source))
}
