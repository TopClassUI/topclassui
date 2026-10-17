import { Meter } from '../index.js'

/** The bar grows from the right, the inline start, with no class of its own for it. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="grid max-w-sm gap-4">
      <div className="grid gap-1">
        <span id="disk-ar" className="text-sm">القرص: ٥١٢ غيغابايت من ١ تيرابايت</span>
        <Meter min={0} max={1024} value={512} aria-valuetext="٥١٢ غيغابايت من ١ تيرابايت" aria-labelledby="disk-ar" />
      </div>
      <Meter value={30} tone="success" aria-label="البطارية" />
    </div>
  )
}
