// Wraps each `##` heading and what follows it, up to the next one, in a <section> (docs-site S2).
/** @returns {(tree: import('mdast').Root) => void} */
export default function remarkSections() {
  return (tree) => {
    const out = []
    let current = null
    for (const node of tree.children) {
      if (node.type === 'heading' && node.depth === 2) {
        current = { type: 'mdxJsxFlowElement', name: 'section', attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'flex flex-col gap-3' }], children: [node] }
        out.push(current)
      } else if (current !== null && node.type !== 'yaml') {
        current.children.push(node)
      } else {
        out.push(node)
      }
    }
    tree.children = out
  }
}
