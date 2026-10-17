import { bell } from '#icons/data/bell.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'
import type { BannerDesignProps } from '../index.js'

/** The docs stage: the Try it controls set the tone and the x, and the action follows the tone. */
export default function Demo({ tone, dismissible = false }: BannerDesignProps = {}) {
  return (
    <Banner
      tone={tone}
      dismissible={dismissible}
      id="banner-playground"
      aria-label="Release announcement"
      icon={<Svg icon={bell} size="xs" />}
      action={<Button size="sm" variant="outline" tone={tone} render={<a href="/changelog" />}>Read more</Button>}
    >
      Version 2 is out, with faster builds and a new theme editor.
    </Banner>
  )
}
