import { Button } from '../index.js'
import type { ButtonDesignProps } from '../types.js'

/** The site's Try it stage: every prop of the schema, passed straight through. */
export default function Demo(props: ButtonDesignProps) {
  return <Button {...props}>Save</Button>
}
