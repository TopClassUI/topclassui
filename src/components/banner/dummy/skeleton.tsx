import { Banner, BannerSkeleton } from '../index.js'

/** Each banner above the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <div data-pair="plain" className="grid gap-2">
        <Banner tone="info" aria-label="Release announcement">Version 2 is out.</Banner>
        <BannerSkeleton />
      </div>
      <div data-pair="dismissible" className="grid gap-2">
        <Banner dismissible id="skeleton-demo" tone="warning" aria-label="Maintenance notice">Maintenance on Sunday.</Banner>
        <BannerSkeleton dismissible />
      </div>
    </div>
  )
}
