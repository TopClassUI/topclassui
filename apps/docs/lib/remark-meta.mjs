// Copies a fence's info string onto the code element as data-meta, which MDX otherwise drops (docs-site S3).
// A title shown again on the same page gets data-repeat, its occurrence, so two code regions never share a name.
/** @returns {(tree: import('mdast').Root) => void} */
export default function remarkMeta() {
  return (tree) => {
    const seen = new Map()
    const visit = (node) => {
      if (node.type === 'code' && node.meta) {
        const title = /title="([^"]*)"/.exec(node.meta)?.[1]
        const count = title === undefined ? 0 : (seen.get(title) ?? 0) + 1
        if (title !== undefined) seen.set(title, count)
        node.data ??= {}
        node.data.hProperties = { ...node.data.hProperties, 'data-meta': node.meta, ...(count > 1 ? { 'data-repeat': String(count) } : {}) }
      }
      if ('children' in node) for (const child of node.children) visit(child)
    }
    visit(tree)
  }
}
