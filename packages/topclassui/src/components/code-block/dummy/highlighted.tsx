import { CodeBlock } from '../index.js'

const CODE = `import { CodeBlock } from 'topclassui/code-block'

// Coloured by the caller, copied as plain text
export const sample = <CodeBlock title="page.tsx">{code}</CodeBlock>`

const KEYWORD = 'font-semibold'
const STRING = 'italic'
const COMMENT = 'text-neutral-on-solid/70'

/** highlighted: nodes the caller made, here by hand, rendered in place of the text. The button
 * still copies children. A highlighter at build time would hand the same kind of nodes. */
export default function Demo() {
  return (
    <CodeBlock
      lang="tsx"
      title="sample.tsx"
      highlighted={(
        <>
          <span className={KEYWORD}>import</span>{' { CodeBlock } '}<span className={KEYWORD}>from</span>{' '}
          <span className={STRING}>{`'topclassui/code-block'`}</span>
          {'\n\n'}
          <span className={COMMENT}>{'// Coloured by the caller, copied as plain text'}</span>
          {'\n'}
          <span className={KEYWORD}>export const</span>{' sample = <CodeBlock title='}<span className={STRING}>{'"page.tsx"'}</span>
          {'>{code}</CodeBlock>'}
        </>
      )}
    >
      {CODE}
    </CodeBlock>
  )
}
