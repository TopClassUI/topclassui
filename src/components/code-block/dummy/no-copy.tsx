import { CodeBlock } from '../index.js'

/** A title and no button: the block ships no script at all. */
export default function Demo() {
  return (
    <CodeBlock lang="css" title="globals.css" showCopy={false}>
      {`:root {
  --tc-radius: 0.75rem;
}`}
    </CodeBlock>
  )
}
