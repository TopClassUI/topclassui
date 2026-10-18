// Content strings mark code with backticks; each run becomes inline code, left to right inside an Arabic sentence (S10).
import { INLINE_CODE } from './classes'

export function InlineText({ text }: { text: string }) {
  return text.split('`').map((part, index) => (index % 2 === 1
    ? <code key={index} dir="ltr" className={INLINE_CODE}>{part}</code>
    : part))
}
