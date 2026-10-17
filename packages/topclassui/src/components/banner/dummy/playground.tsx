import { bell } from '#icons/data/bell.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'
import type { BannerDesignProps } from '../index.js'

/** The docs stage: the Try it controls set the tone and the x; the neutral action reads on every tone. */
// BannerDismissal takes a boolean beside the id, never an optional one.
export default function Demo(props: Omit<BannerDesignProps, 'dismissible'> & { dismissible: boolean } = { dismissible: false }) {
  return (
    <Banner {...props}
      id="banner-playground"
      aria-label="Version 2 announcement"
      icon={<Svg icon={bell} size="xs" />}
      action={<Button size="sm" variant="outline" tone="neutral" render={<a href="/changelog" />}>Read more</Button>}
    >
      Version 2 is out, with faster builds and a new theme editor.
    </Banner>
  )
}
