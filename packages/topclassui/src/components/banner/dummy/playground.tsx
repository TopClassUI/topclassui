import { Button } from '#components/button/index.js'
import { Banner } from '../index.js'
import type { BannerDesignProps } from '../index.js'

/** The docs stage, as the frame draws it: 460 px wide, dismissible, the x 12 px from the action, with the action as a link in the banner's colour; Try it sets the tone and the x. */
// BannerDismissal takes a boolean beside the id, never an optional one.
export default function Demo({ dismissible = true, ...props }: Omit<BannerDesignProps, 'dismissible'> & { dismissible?: boolean } = {}) {
  return (
    <Banner {...props}
      dismissible={dismissible}
      id="banner-playground"
      className="max-w-115"
      aria-label="Version 0.2 announcement"
      action={
        <Button size="sm" variant="link" className="-me-1.25 px-0 font-semibold text-current" render={<a href="#" />}>
          Read more
        </Button>
      }
    >
      Version 0.2 is out, with a Drawer and full RTL support.
    </Banner>
  )
}
