// Copies a fence's info string onto the code element as data-meta, which MDX otherwise drops (docs-site S3).
/** @returns {(tree: import('mdast').Root) => void} */
export default function remarkMeta() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'code' && node.meta) {
        node.data ??= {}
        node.data.hProperties = { ...node.data.hProperties, 'data-meta': node.meta }
      }
      if ('children' in node) for (const child of node.children) visit(child)
    }
    visit(tree)
  }
}
