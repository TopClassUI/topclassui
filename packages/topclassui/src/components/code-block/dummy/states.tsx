import { CodeBlock } from '../index.js'

/** One small block per state the server renders, named by its aria-label; the button's hover and "Copied" are live in
 * the browser. The wrapped line is one the block's width breaks. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <div role="group" aria-label="idle">
        <CodeBlock lang="tsx" title="button.tsx" className="w-32">{'<Button/>'}</CodeBlock>
      </div>
      <div role="group" aria-label="wrapped">
        <CodeBlock lang="tsx" title="wrapped" className="w-32" wrap>{'<Button size="sm"/>'}</CodeBlock>
      </div>
      <div role="group" aria-label="no header">
        <CodeBlock lang="tsx" showCopy={false} className="w-32">{'<Button/>'}</CodeBlock>
      </div>
    </div>
  )
}
