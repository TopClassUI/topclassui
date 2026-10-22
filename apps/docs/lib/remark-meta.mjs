// Copies a fence's info string onto the code element as data-meta, which MDX otherwise drops (docs-site S3).
// A name shown again on the same page gets data-repeat, its occurrence, so two code regions never share a name:
// the title, or for an untitled fence the "terminal" or "code" it is named by; a WrongRight pane is named by its pair.
const SHELL = new Set(['bash', 'sh', 'shell'])

/** @returns {(tree: import('mdast').Root) => void} */
export default function remarkMeta() {
  return (tree) => {
    const seen = new Map()
    const visit = (node, inPair) => {
      if (node.type === 'code') {
        const title = node.meta ? /title="([^"]*)"/.exec(node.meta)?.[1] : undefined
        const name = title ?? (inPair ? undefined : SHELL.has(node.lang ?? '') ? '\0terminal' : '\0code')
        const count = name === undefined ? 0 : (seen.get(name) ?? 0) + 1
        if (name !== undefined) seen.set(name, count)
        const props = { ...(node.meta ? { 'data-meta': node.meta } : {}), ...(count > 1 ? { 'data-repeat': String(count) } : {}) }
        if (Object.keys(props).length > 0) {
          node.data ??= {}
          node.data.hProperties = { ...node.data.hProperties, ...props }
        }
      }
      const pair = inPair || (node.type === 'mdxJsxFlowElement' && node.name === 'WrongRight')
      if ('children' in node) for (const child of node.children) visit(child, pair)
    }
    visit(tree, false)
  }
}
