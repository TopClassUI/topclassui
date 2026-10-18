// R-5.12-1: the pure helpers of the hook, with no React in them.
import type { ListOption } from '#shared/contracts/option.js'

/** The text of the labels that point at a trigger, less the Select's own box inside a label that wraps it. */
export function readNameFromLabels(trigger: HTMLButtonElement | null): string | undefined {
  const box = trigger?.parentElement ?? null
  const text = [...(trigger?.labels ?? [])].map((label) => readTextOutside(label, box)).join(' ').replace(/\s+/g, ' ').trim()
  return text === '' ? undefined : text
}

/** The text under a node, skipping one subtree: a wrapping label would otherwise add the value to the name. */
function readTextOutside(node: Node, skip: Node | null): string {
  if (node === skip) return ''
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  return [...node.childNodes].map((child) => readTextOutside(child, skip)).join('')
}

/** An option's key is its value, which a form already needs unique. */
export function keyOfOption(option: ListOption): string {
  return option.value
}
