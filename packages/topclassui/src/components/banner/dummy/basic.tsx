import { bell } from '#icons/data/bell.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

/** The drawn banner: an icon, the message and a link, on the soft info tone. */
export default function Demo() {
  return (
    <Banner
      tone="info"
      aria-label="New version announcement"
      icon={<Svg icon={bell} size="xs" />}
      action={<Button size="sm" variant="outline" tone="info" render={<a href="/changelog" />}>Read the changelog</Button>}
    >
      Version 2 is out, with faster builds and a new theme editor.
    </Banner>
  )
}
