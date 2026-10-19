import { tagVariants } from '../index.js'

/** The ring a linked tag wears on focus-visible, drawn at rest so the strip can show it. */
const RING = 'outline-solid outline-(length:--tc-ring-width) outline-offset-(length:--tc-ring-offset) outline-ring'
const chip = tagVariants({ tone: 'primary', interactive: true })

/** One cell per state of a linked tag, named by its aria-label, as Figma 135:285 draws them. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="idle"><a href="#design" className={chip}>design</a></div>
      <div role="group" aria-label="hover"><a href="#design" className={`${chip} bg-(--tc-soft-hover)`}>design</a></div>
      <div role="group" aria-label="active"><a href="#design" className={`${chip} bg-(--tc-soft-active)`}>design</a></div>
      <div role="group" aria-label="focus-visible"><a href="#design" className={`${chip} ${RING}`}>design</a></div>
      <div role="group" aria-label="disabled"><a aria-disabled="true" data-disabled="" className={chip}>design</a></div>
    </div>
  )
}
