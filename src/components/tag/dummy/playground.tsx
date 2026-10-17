import { Tag } from '../index.js'
import type { TagDesignProps } from '../types.js'

/** The site's Try it stage: every prop of the schema, passed straight through. */
export default function Demo(props: TagDesignProps) {
  return <Tag {...props}>Design systems</Tag>
}
