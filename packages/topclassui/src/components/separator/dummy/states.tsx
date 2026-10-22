import { Separator } from '../index.js'

/** One cell per state Figma 137:815 draws, named by its aria-label. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-10">
      <div role="group" aria-label="horizontal" className="w-28"><Separator /></div>
      <div role="group" aria-label="vertical" className="flex h-10"><Separator orientation="vertical" /></div>
      <div role="group" aria-label="with label" className="w-28"><Separator className="font-mono text-[0.6875rem]">or</Separator></div>
    </div>
  )
}
