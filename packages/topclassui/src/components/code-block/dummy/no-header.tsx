import { CodeBlock } from '../index.js'

/** No title and no copy button: no header either, so the code takes the top padding back. */
export default function Demo() {
  return (
    <CodeBlock lang="sh" showCopy={false}>
      {'pnpm add topclassui zod'}
    </CodeBlock>
  )
}
