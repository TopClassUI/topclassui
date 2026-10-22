import { image } from '#icons/data/image.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { CardBody, CardFooter, CardHeader, CardMedia, CardRoot } from '../index.js'

/** The parts the frame's Try it switches on and off: the whole card as a link, the media band, the footer. */
interface PlaygroundProps {
  interactive?: boolean | undefined
  media?: boolean | undefined
  footer?: boolean | undefined
}

/** The site's Try it stage, the frame's card. A link holds no button, so an interactive card's footer is its call in words. */
export default function Demo({ interactive = false, media = false, footer = true }: PlaygroundProps = {}) {
  return (
    <div className="w-75 max-w-full">
      <CardRoot render={interactive ? <a href="#card" /> : undefined}>
        {media ? <CardMedia><Svg icon={image} size="xl" /></CardMedia> : null}
        <CardHeader>
          <h2>Ship it everywhere</h2>
        </CardHeader>
        <CardBody>One design system for a browser, a phone and an Arabic page.</CardBody>
        {footer ? (
          <CardFooter>
            {interactive ? <span className="text-sm font-medium text-body">Read more</span> : (
              <>
                <Button size="xs">Read more</Button>
                <Button size="xs" variant="outline" tone="neutral" className="border-line bg-surface">Later</Button>
              </>
            )}
          </CardFooter>
        ) : null}
      </CardRoot>
    </div>
  )
}
