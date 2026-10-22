import { Kbd } from '../index.js'

/** The docs stage as Figma 135:411 draws it: three sibling keys, no group and no plus. */
export default function Demo() {
  return (
    <div className="flex items-center gap-1">
      <Kbd>Ctrl</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>K</Kbd>
    </div>
  )
}
