import type { CodeBlockDesignProps } from '../index.js'
import { CodeBlock } from '../index.js'

/** The docs stage as the frame draws it: three short lines in a 420 px block; the Try it controls hand their values in
 * as props. The long line that wrap breaks is the long-line and wrap demos'. */
export default function Demo(props: CodeBlockDesignProps) {
  return (
    <CodeBlock lang="tsx" title="download.tsx" className="w-full max-w-105" {...props}>
      {`<Button variant="solid" size="md">
  Download
</Button>`}
    </CodeBlock>
  )
}
