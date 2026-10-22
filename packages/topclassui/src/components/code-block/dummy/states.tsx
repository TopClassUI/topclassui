import { en } from '#shared/labels/en.js'
import { CodeBlock } from '../index.js'

/** One small block per state the server renders, named by its aria-label, untitled by an icon as the strip draws it; the
 * button's hover and "Copied" are live in the browser. The wrapped line is one the block's width breaks; the untitled
 * block's region takes a name of its own from labels, since a page may hold another untitled block. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <div role="group" aria-label="idle">
        <CodeBlock lang="tsx" title="idle" icon={null} className="w-32">{'<Button/>'}</CodeBlock>
      </div>
      <div role="group" aria-label="wrapped">
        <CodeBlock lang="tsx" title="wrap" icon={null} className="w-32" wrap>{'<Button size="sm"/>'}</CodeBlock>
      </div>
      <div role="group" aria-label="no header">
        <CodeBlock lang="tsx" showCopy={false} className="w-32" labels={{ ...en, common: { ...en.common, code: 'Untitled code' } }}>{'<Button/>'}</CodeBlock>
      </div>
    </div>
  )
}
