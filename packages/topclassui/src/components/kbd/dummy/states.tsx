import { Kbd } from '../index.js'

/** One cell per state Figma 135:411 draws, named by its aria-label; hover is drawn identical to idle. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="idle" className="flex gap-1"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></div>
      <div role="group" aria-label="hover" className="flex gap-1"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></div>
      <div role="group" aria-label="active" className="flex gap-1"><Kbd pressed>Ctrl</Kbd><Kbd pressed>K</Kbd></div>
      <div role="group" aria-label="disabled" className="flex gap-1"><Kbd disabled>Ctrl</Kbd><Kbd disabled>K</Kbd></div>
    </div>
  )
}
