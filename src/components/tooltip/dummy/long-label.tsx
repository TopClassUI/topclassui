import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

const LONG = 'Save this document and continue to the next step of the wizard'
const FILE = 'quarterly-report-final-v2-reviewed-by-legal-and-finance.pdf'

/** Why Tooltip is in Unit 1: each Button truncates its label in a narrow box, and the
 * tooltip shows it whole. The label is inside the Button, so a server render keeps its
 * truncating span. The sentence wraps at max-w-xs; the file name breaks anywhere. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-50 rounded-box border border-line p-2">
        <TooltipRoot>
          <TooltipTrigger render={<Button>{LONG}</Button>} />
          <TooltipPopup>{LONG}</TooltipPopup>
        </TooltipRoot>
      </div>
      <div className="w-50 rounded-box border border-line p-2">
        <TooltipRoot>
          <TooltipTrigger render={<Button variant="outline">{FILE}</Button>} />
          <TooltipPopup placement="bottom-start">{FILE}</TooltipPopup>
        </TooltipRoot>
      </div>
    </div>
  )
}
