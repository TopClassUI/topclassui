import { image } from '#icons/data/image.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { CardBody, CardFooter, CardHeader, CardMedia, CardRoot } from '../index.js'

/** The third drawing: a media band above the title, then the text and two actions. */
export default function Demo() {
  return (
    <div className="max-w-xs">
      <CardRoot>
        <CardMedia>
          <Svg icon={image} size="xl" />
        </CardMedia>
        <CardHeader>
          <h2>Ship it everywhere</h2>
        </CardHeader>
        <CardBody>One design system for a browser, a phone and an Arabic page.</CardBody>
        <CardFooter>
          <Button size="sm">Read more</Button>
          <Button size="sm" variant="outline" tone="neutral">Later</Button>
        </CardFooter>
      </CardRoot>
    </div>
  )
}
