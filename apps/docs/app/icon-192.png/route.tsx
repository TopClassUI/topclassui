// /icon-192.png for the manifest and the Organization logo, prerendered: a GET route handler is dynamic unless it opts out (rule 4).
import { iconTile } from '../../lib/icon-tile'

export const dynamic = 'force-static'

export function GET() {
  return iconTile(192)
}
