import { describeBarContrast } from './bar-contrast.js'

// The static pages are the server HTML with no script: Progress paints from that HTML alone.
describeBarContrast('progress', 'progressbar')
