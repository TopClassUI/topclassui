import { CodeBlock } from '../index.js'

const LINE = ["const token = '", 'a1b2c3d4e5'.repeat(28), "abcd'"].join('')

/** One line of 300 characters: it scrolls inside the block, and the page never scrolls sideways. */
export default function Demo() {
  return (
    <CodeBlock lang="ts" title="token.ts">
      {LINE}
    </CodeBlock>
  )
}
