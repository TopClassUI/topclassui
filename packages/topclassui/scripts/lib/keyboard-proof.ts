// R-5.6-1 per component: which folders of a unit take the focus, and the spec that presses their keys and reads their ring.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** The eight components docs/figma/unit-5.md builds, in its build order; Units 1 to 4 prove their keys on their own branches. */
export const UNIT_5 = ['meter', 'stepper', 'code-block', 'field', 'form', 'file-upload', 'tree-view', 'date-picker'] as const

/** The components of a unit that take no focus at all, each with the reason no keyboard promise applies to it. */
export const NO_FOCUS: Readonly<Record<string, string>> = {
  meter: 'role="meter" is read, never operated: no input, no button, no tab stop',
  stepper: 'a list of steps for display only: no client half, no button, no link, no tab stop',
}

/** Markup that can take the focus, in a component's .tsx sources: a native control, a link or a tabIndex. */
const FOCUSABLE = /<(?:button|input|select|textarea|a)[\s>]|\btabIndex\b|\bhref\b/

/** Whether a component folder can take the focus: a client half, or focusable markup in any of its sources. */
export function takesFocus(folder: string): boolean {
  if (existsSync(join(folder, 'client.tsx')) || existsSync(join(folder, 'hook.ts'))) return true
  const sources = readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx') && !/[\\/](?:dummy|test)$/.test(entry.parentPath))
  return sources.some((entry) => FOCUSABLE.test(readFileSync(join(entry.parentPath, entry.name), 'utf8')))
}

/** A spec is proof when it presses keys and reads the ring: keyboard-<slug>.spec.ts, else the component's own <slug>.spec.ts. */
export function proofOf(root: string, slug: string): string | null {
  for (const name of [`keyboard-${slug}.spec.ts`, `${slug}.spec.ts`]) {
    const file = join(root, 'e2e', name)
    if (!existsSync(file)) continue
    const text = readFileSync(file, 'utf8')
    if (text.includes('keyboard.press(') && text.includes('expectRing(')) return name
  }
  return null
}

/** What is wrong with the keyboard proof of these components, one line each; empty when every one is proven or excused. */
export function keyboardProblems(root: string, slugs: readonly string[], noFocus: Readonly<Record<string, string>> = NO_FOCUS): string[] {
  return slugs.flatMap((slug) => {
    const focus = takesFocus(join(root, 'src', 'components', slug))
    if (slug in noFocus) return focus ? [`${slug}: excused as taking no focus, and it now does`] : []
    if (!focus) return [`${slug}: takes no focus and has no reason in NO_FOCUS`]
    return proofOf(root, slug) === null ? [`${slug}: no e2e/keyboard-${slug}.spec.ts or e2e/${slug}.spec.ts presses a key and calls expectRing`] : []
  })
}
