import { Button } from '#components/button/index.js'
import { Banner } from '../index.js'
import type { BannerDesignProps } from '../index.js'

/** The docs stage, as the frame draws it: the Try it controls set the tone and the x; the action is a link in the banner's colour. */
// BannerDismissal takes a boolean beside the id, never an optional one.
export default function Demo(props: Omit<BannerDesignProps, 'dismissible'> & { dismissible: boolean } = { dismissible: false }) {
  return (
    <Banner {...props}
      id="banner-playground"
      aria-label="Release announcement"
      action={<Button size="sm" variant="link" className="px-0 font-semibold text-current" render={<a href="/changelog" />}>Read more</Button>}
    >
      Version 0.2 is out, with a Drawer and full RTL support.
    </Banner>
  )
}
